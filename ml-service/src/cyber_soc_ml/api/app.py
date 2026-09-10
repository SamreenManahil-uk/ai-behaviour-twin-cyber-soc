"""Internal FastAPI service for trusted local Cyber SOC ML models."""

import math
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, field_validator

from cyber_soc_ml.anomaly import load_bundle as load_anomaly_bundle
from cyber_soc_ml.anomaly import predict as predict_anomaly
from cyber_soc_ml.behaviour_twin import BehaviourTwin, EndpointEvent
from cyber_soc_ml.prediction import load_bundle as load_xgboost_bundle
from cyber_soc_ml.prediction import predict as predict_xgboost
from cyber_soc_ml.risk_engine import score_risk

API_VERSION = "1.0.0"
MAX_BODY_BYTES = 256 * 1024
LEAKAGE_FIELDS = frozenset({"id", "label", "attack_cat"})


class NetworkPredictionRequest(BaseModel):
    """One validated UNSW-NB15 network-flow event."""

    model_config = ConfigDict(extra="forbid", strict=True)
    features: dict[str, str | int | float]

    @field_validator("features")
    @classmethod
    def validate_features(cls, value: dict[str, str | int | float]):
        if not value:
            raise ValueError("features must not be empty")
        for name, item in value.items():
            if not isinstance(name, str) or not name.strip():
                raise ValueError("feature names must be non-empty strings")
            if isinstance(item, bool):
                raise TypeError(f"{name} must not be boolean")
            if isinstance(item, float) and not math.isfinite(item):
                raise ValueError(f"{name} must be finite")
        return value


class HybridRiskRequest(BaseModel):
    """Already-produced security signals describing the same context."""

    model_config = ConfigDict(extra="forbid", strict=True)
    supervised_threat_score: float
    anomaly_score: float
    behaviour_deviation: float
    rule_score: float
    rule_evidence: list[str] | None = None


class BehaviourScoreRequest(BaseModel):
    """Frozen JSON profile plus one simulated current endpoint event."""

    model_config = ConfigDict(extra="forbid", strict=True)
    profile: dict[str, Any]
    event: dict[str, Any]


def _profile_from_json(raw: dict[str, Any]) -> BehaviourTwin:
    values = dict(raw)
    collections = (
        "login_hours",
        "numeric_baselines",
        "usual_processes",
        "usual_destination_ips",
    )
    for name in collections:
        if name not in values or not isinstance(values[name], list):
            raise ValueError(f"profile.{name} must be a JSON array")
    values["login_hours"] = tuple(values["login_hours"])
    values["numeric_baselines"] = tuple(
        tuple(pair) if isinstance(pair, list) else pair
        for pair in values["numeric_baselines"]
    )
    values["usual_processes"] = tuple(values["usual_processes"])
    values["usual_destination_ips"] = tuple(values["usual_destination_ips"])
    return BehaviourTwin(**values)


def _model_summary(bundle: dict[str, Any] | None) -> dict[str, Any]:
    if bundle is None:
        return {"ready": False, "modelVersion": None}
    return {
        "ready": True,
        "modelVersion": bundle["metadata"]["model_version"],
    }


def create_app(
    xgboost_bundle: dict[str, Any] | None = None,
    anomaly_bundle: dict[str, Any] | None = None,
    *,
    load_models: bool = True,
) -> FastAPI:
    """Create the API; injected bundles keep automated tests lightweight."""

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        if load_models:
            application.state.xgboost_bundle = load_xgboost_bundle()
            application.state.anomaly_bundle = load_anomaly_bundle()
        yield

    application = FastAPI(
        title="Cyber SOC ML Service",
        description=(
            "Internal inference service for trusted local models. Scores are "
            "prioritisation or unusualness signals, not calibrated probabilities."
        ),
        version=API_VERSION,
        lifespan=lifespan,
    )
    application.state.xgboost_bundle = xgboost_bundle
    application.state.anomaly_bundle = anomaly_bundle

    @application.middleware("http")
    async def limit_request_size(request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length is not None:
            try:
                size = int(content_length)
            except ValueError:
                return JSONResponse(
                    status_code=400,
                    content={"detail": "Invalid Content-Length header"},
                )
            if size > MAX_BODY_BYTES:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "Request body is too large"},
                )
        return await call_next(request)

    @application.exception_handler(Exception)
    async def unexpected_error_handler(request: Request, exc: Exception):
        del request, exc
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal ML service error"},
        )

    @application.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request,
        exc: RequestValidationError,
    ):
        del request
        del exc
        return JSONResponse(
            status_code=422,
            content={"detail": "Request validation failed"},
        )

    @application.get("/health", tags=["Health"])
    async def health(request: Request):
        xgb = getattr(request.app.state, "xgboost_bundle", None)
        anomaly = getattr(request.app.state, "anomaly_bundle", None)
        ready = xgb is not None and anomaly is not None
        return {
            "status": "healthy" if ready else "degraded",
            "service": "cyber-soc-ml",
            "version": API_VERSION,
            "models": {
                "xgboost": _model_summary(xgb),
                "isolationForest": _model_summary(anomaly),
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    @application.post("/v1/predict/network", tags=["Inference"])
    async def network_prediction(payload: NetworkPredictionRequest, request: Request):
        xgb = getattr(request.app.state, "xgboost_bundle", None)
        anomaly = getattr(request.app.state, "anomaly_bundle", None)
        if xgb is None or anomaly is None:
            return JSONResponse(
                status_code=503,
                content={"detail": "Required ML models are unavailable"},
            )

        supplied = set(payload.features)
        leaked = supplied.intersection(LEAKAGE_FIELDS)
        if leaked:
            return JSONResponse(
                status_code=422,
                content={"detail": f"Leakage fields are forbidden: {sorted(leaked)}"},
            )

        expected = set(xgb["metadata"]["expected_raw_features"])
        anomaly_expected = set(anomaly["metadata"]["expected_raw_features"])
        if expected != anomaly_expected:
            return JSONResponse(
                status_code=503,
                content={"detail": "ML model schemas are incompatible"},
            )

        missing = expected.difference(supplied)
        unexpected = supplied.difference(expected)
        if missing or unexpected:
            return JSONResponse(
                status_code=422,
                content={
                    "detail": "Feature schema validation failed",
                    "missingFeatures": sorted(missing),
                    "unexpectedFeatures": sorted(unexpected),
                },
            )

        try:
            supervised = predict_xgboost(payload.features, xgb)
            unusualness = predict_anomaly(payload.features, anomaly)
        except (TypeError, ValueError) as exc:
            return JSONResponse(status_code=422, content={"detail": str(exc)})

        return {
            "classification": (
                "malicious" if supervised["predicted_label"] == 1 else "benign"
            ),
            "predictedMalicious": supervised["predicted_label"] == 1,
            "supervisedThreatScore": supervised["model_score"],
            "supervisedRiskScore": supervised["network_risk_score"],
            "predictedAnomaly": unusualness["predicted_anomaly"],
            "anomalyScore": unusualness["anomaly_score"],
            "anomalyRiskScore": unusualness["anomaly_risk_score"],
            "xgboostModelVersion": supervised["model_version"],
            "anomalyModelVersion": unusualness["model_version"],
            "explanations": [
                "The supervised threat score is an uncalibrated XGBoost output.",
                unusualness["scoring_explanation"],
            ],
        }

    @application.post("/v1/risk/hybrid", tags=["Risk"])
    async def hybrid_risk(payload: HybridRiskRequest):
        try:
            return score_risk(
                payload.supervised_threat_score,
                payload.anomaly_score,
                payload.behaviour_deviation,
                payload.rule_score,
                payload.rule_evidence,
            )
        except (TypeError, ValueError) as exc:
            return JSONResponse(status_code=422, content={"detail": str(exc)})

    @application.post("/v1/behaviour/score", tags=["Behaviour Twin"])
    async def behaviour_score(payload: BehaviourScoreRequest):
        try:
            profile = _profile_from_json(payload.profile)
            event = EndpointEvent(**payload.event)
            return {
                **profile.score(event),
                "profileVersion": profile.profile_version,
                "explanation": (
                    "Behaviour deviation measures a simulated event's difference "
                    "from frozen historical behaviour; it is not an attack probability."
                ),
            }
        except (TypeError, ValueError) as exc:
            return JSONResponse(status_code=422, content={"detail": str(exc)})

    return application


app = create_app()
