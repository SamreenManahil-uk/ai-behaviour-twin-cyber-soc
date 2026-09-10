"""FastAPI boundary tests without retraining or loading production artifacts."""

import json

import cyber_soc_ml.api.app as api_module
import pytest
from cyber_soc_ml.api.app import MAX_BODY_BYTES, create_app
from fastapi.testclient import TestClient

FEATURES = {"feature_a": 1.0, "feature_b": "tcp"}
XGB_BUNDLE = {
    "metadata": {
        "expected_raw_features": list(FEATURES),
        "model_version": "xgboost-test-v1",
    }
}
ANOMALY_BUNDLE = {
    "metadata": {
        "expected_raw_features": list(FEATURES),
        "model_version": "isolation-test-v1",
    }
}


@pytest.fixture
def client(monkeypatch):
    def fake_xgboost_predict(features, bundle):
        assert features == FEATURES
        assert bundle is XGB_BUNDLE
        return {
            "predicted_label": 1,
            "predicted_class": "attack",
            "model_score": 0.91,
            "network_risk_score": 91.0,
            "threshold": 0.5,
            "model_version": "xgboost-test-v1",
        }

    def fake_anomaly_predict(features, bundle):
        assert features == FEATURES
        assert bundle is ANOMALY_BUNDLE
        return {
            "predicted_anomaly": True,
            "anomaly_score": 0.87,
            "anomaly_risk_score": 87.0,
            "threshold": 0.95,
            "model_version": "isolation-test-v1",
            "scoring_explanation": "Test unusualness score; not a probability.",
        }

    monkeypatch.setattr(api_module, "predict_xgboost", fake_xgboost_predict)
    monkeypatch.setattr(api_module, "predict_anomaly", fake_anomaly_predict)

    application = create_app(
        XGB_BUNDLE,
        ANOMALY_BUNDLE,
        load_models=False,
    )
    with TestClient(application, raise_server_exceptions=False) as test_client:
        yield test_client


def test_health_reports_model_readiness(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "healthy"
    assert body["service"] == "cyber-soc-ml"
    assert body["models"]["xgboost"]["ready"] is True
    assert body["models"]["isolationForest"]["ready"] is True
    assert "+00:00" in body["timestamp"]


def test_network_prediction_returns_two_distinct_signals(client):
    response = client.post("/v1/predict/network", json={"features": FEATURES})
    assert response.status_code == 200
    body = response.json()
    assert body["classification"] == "malicious"
    assert body["predictedMalicious"] is True
    assert body["supervisedThreatScore"] == pytest.approx(0.91)
    assert body["predictedAnomaly"] is True
    assert body["anomalyScore"] == pytest.approx(0.87)
    assert "probability" in body["explanations"][1]


@pytest.mark.parametrize("field", ["id", "label", "attack_cat"])
def test_network_rejects_leakage_fields(client, field):
    response = client.post(
        "/v1/predict/network",
        json={"features": FEATURES | {field: 1}},
    )
    assert response.status_code == 422
    assert "forbidden" in response.json()["detail"]


def test_network_rejects_missing_and_unexpected_features(client):
    missing = client.post(
        "/v1/predict/network",
        json={"features": {"feature_a": 1.0}},
    )
    assert missing.status_code == 422
    assert missing.json()["missingFeatures"] == ["feature_b"]

    unexpected = client.post(
        "/v1/predict/network",
        json={"features": FEATURES | {"surprise": 5}},
    )
    assert unexpected.status_code == 422
    assert unexpected.json()["unexpectedFeatures"] == ["surprise"]


@pytest.mark.parametrize("invalid_value", [True, None])
def test_invalid_feature_values_rejected(client, invalid_value):
    response = client.post(
        "/v1/predict/network",
        json={"features": {"feature_a": invalid_value, "feature_b": "tcp"}},
    )
    assert response.status_code == 422


def test_numeric_nan_rejected(client):
    response = client.post(
        "/v1/predict/network",
        content=(
            b'{"features":{"feature_a":NaN,"feature_b":"tcp"}}'
        ),
        headers={"content-type": "application/json"},
    )
    assert response.status_code == 422


def test_unavailable_models_return_503():
    application = create_app(load_models=False)
    with TestClient(application) as test_client:
        response = test_client.post(
            "/v1/predict/network",
            json={"features": FEATURES},
        )
    assert response.status_code == 503


def test_hybrid_endpoint_uses_existing_engine(client):
    response = client.post(
        "/v1/risk/hybrid",
        json={
            "supervised_threat_score": 0.9,
            "anomaly_score": 0.8,
            "behaviour_deviation": 0.85,
            "rule_score": 1.0,
            "rule_evidence": ["Simulated encoded command"],
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["risk_score"] == pytest.approx(87.75)
    assert body["severity"] == "Critical"
    assert body["scoring_version"] == "hybrid-risk-v1"


def profile_payload():
    return {
        "endpoint_id": "WIN-DEMO-001",
        "user_id": "analyst-demo",
        "generated_timestamp": "2026-09-10T10:00:00+00:00",
        "history_end": "2026-09-10T09:00:00+00:00",
        "sample_count": 20,
        "minimum_history": 20,
        "usual_frequency": 0.05,
        "login_hours": [9.0],
        "numeric_baselines": [[0.0, 0.0], [10.0, 1.0], [1000.0, 100.0]],
        "usual_processes": ["explorer.exe"],
        "usual_destination_ips": ["192.0.2.10"],
        "powershell_frequency": 0.0,
        "schema_version": 1,
        "profile_version": "endpoint-behaviour-v1",
    }


def endpoint_event(**changes):
    event = {
        "endpoint_id": "WIN-DEMO-001",
        "user_id": "analyst-demo",
        "timestamp": "2026-09-10T11:00:00+00:00",
        "successful_login": True,
        "failed_login_count": 0,
        "process_name": "explorer.exe",
        "powershell_used": False,
        "encoded_command": False,
        "file_access_count": 10,
        "outbound_bytes": 1000,
        "destination_ip": "192.0.2.10",
        "privilege_event": False,
    }
    event.update(changes)
    return event


def test_behaviour_normal_and_suspicious_scores(client):
    normal = client.post(
        "/v1/behaviour/score",
        json={"profile": profile_payload(), "event": endpoint_event()},
    )
    assert normal.status_code == 200
    assert normal.json()["behaviour_deviation"] < 0.25

    suspicious = client.post(
        "/v1/behaviour/score",
        json={
            "profile": profile_payload(),
            "event": endpoint_event(
                timestamp="2026-09-11T02:00:00+00:00",
                failed_login_count=20,
                process_name="powershell.exe",
                powershell_used=True,
                encoded_command=True,
                file_access_count=1000,
                outbound_bytes=500000,
                destination_ip="203.0.113.99",
                privilege_event=True,
            ),
        },
    )
    assert suspicious.status_code == 200
    assert (
        suspicious.json()["behaviour_deviation"]
        > normal.json()["behaviour_deviation"]
    )
    assert suspicious.json()["evidence"]


def test_behaviour_identity_mismatch_rejected(client):
    response = client.post(
        "/v1/behaviour/score",
        json={
            "profile": profile_payload(),
            "event": endpoint_event(endpoint_id="WIN-WRONG-999"),
        },
    )
    assert response.status_code == 422


def test_oversized_request_rejected(client):
    response = client.post(
        "/v1/risk/hybrid",
        content=b"{" + b"x" * MAX_BODY_BYTES + b"}",
        headers={"content-type": "application/json"},
    )
    assert response.status_code == 413


def test_openapi_and_strict_json(client):
    openapi = client.get("/openapi.json")
    assert openapi.status_code == 200
    paths = openapi.json()["paths"]
    assert "/health" in paths
    assert "/v1/predict/network" in paths
    assert "/v1/risk/hybrid" in paths
    assert "/v1/behaviour/score" in paths

    response = client.get("/health")
    json.dumps(response.json(), allow_nan=False)


def test_no_model_upload_or_path_parameter(client):
    schema = client.get("/openapi.json").json()
    serialized = json.dumps(schema).lower()
    assert "uploadfile" not in serialized
    assert "model_path" not in serialized
