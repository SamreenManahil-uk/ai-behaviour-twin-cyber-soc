"""Benign-only Isolation Forest with a fixed training-reference ECDF score."""

import json
from collections.abc import Mapping
from datetime import datetime, timezone
from importlib.metadata import version
from pathlib import Path
from platform import python_version
from time import perf_counter

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.utils.validation import check_is_fitted

from cyber_soc_ml.data import EXCLUDED
from cyber_soc_ml.preprocessing import build_preprocessor

MODEL_VERSION = "isolation-forest-network-v1"
MODELS_DIR = Path(__file__).resolve().parents[2] / "models"
BUNDLE_PATH = MODELS_DIR / f"{MODEL_VERSION}.joblib"
PARAMETERS = {
    "n_estimators": 100, "max_samples": 256, "contamination": "auto",
    "max_features": 1.0, "bootstrap": False, "n_jobs": 1,
    "random_state": 42, "warm_start": False,
}
THRESHOLD = 0.95
SCORE_EXPLANATION = (
    "anomaly_score = count(benign training negative score_samples <= event negative "
    "score_samples) / benign training count (right-continuous ECDF). Higher means "
    "more unusual relative to benign training behaviour, not a calibrated attack "
    "probability or XGBoost supervised model_score. Anomaly iff score > 0.95; "
    "anomaly_risk_score = 100 * anomaly_score, not hybrid risk."
)
METHODOLOGY = (
    "Official UNSW-NB15 training split only, filtered to label=0 before schema "
    "selection or preprocessing fit. Labels only select benign rows; no labels "
    "passed to estimator.fit. All benign rows fit preprocessing and supply the "
    "ECDF reference. 100 trees, at most 256 samples per tree, one worker and seed "
    "42 bound runtime; no histogram parameters or exhaustive optimisation. "
    "Fixed 5% expected training false-positive tolerance; right ECDF > 0.95 "
    "includes ties at the boundary and can exceed 5% with tied scores. "
    "No test-based threshold adjustment. contamination offset is unused."
)


def build_model():
    return IsolationForest(**PARAMETERS)


def fit_bundle(X_train, y_train):
    """Accept training predictors and binary membership; fit benign subset only."""
    labels = np.asarray(y_train)
    if (labels.ndim != 1 or len(labels) != len(X_train)
            or not np.isin(labels, [0, 1]).all() or not (labels == 0).any()):
        raise ValueError("Training requires aligned binary labels and benign rows")
    if isinstance(y_train, pd.Series) and not X_train.index.equals(y_train.index):
        raise ValueError("Training feature/label indices must align")
    if EXCLUDED.intersection(X_train.columns):
        raise ValueError("Predictors must exclude id, label and attack_cat")
    benign = X_train.loc[labels == 0].copy()
    start = perf_counter()
    preprocessor = build_preprocessor(benign)
    transformed = preprocessor.fit_transform(benign)
    preprocessing_seconds = perf_counter() - start
    model = build_model()
    start = perf_counter()
    model.fit(transformed)
    model_seconds = perf_counter() - start
    start = perf_counter()
    reference = np.sort(-model.score_samples(transformed))
    reference_seconds = perf_counter() - start
    metadata = {
        "bundle_format_version": 1, "model_version": MODEL_VERSION,
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "expected_raw_features": list(benign.columns),
        "excluded_features": sorted(EXCLUDED), "threshold": THRESHOLD,
        "threshold_rule": "anomaly_score > threshold", "random_seed": 42,
        "benign_training_rows": len(benign),
        "transformed_features": transformed.shape[1],
        "configuration": model.get_params(), "training_methodology": METHODOLOGY,
        "scoring_explanation": SCORE_EXPLANATION,
        "score_reference": {
            "source": "benign official training rows only", "ecdf_side": "right",
            "count": len(reference), "minimum": float(reference[0]),
            "maximum": float(reference[-1]),
            "raw_score_95th_percentile": float(np.quantile(reference, THRESHOLD)),
            "quantile_method": "linear", "raw_score": "-model.score_samples",
            "expected_false_positive_tolerance": 0.05,
            "observed_training_false_positive_rate": float(
                (np.searchsorted(reference, reference, side="right") / len(reference)
                 > THRESHOLD).mean()),
        },
        "training_duration_seconds": {
            "preprocessing_fit_transform": preprocessing_seconds,
            "isolation_forest_fit": model_seconds,
            "benign_reference_scoring": reference_seconds,
            "total": preprocessing_seconds + model_seconds + reference_seconds,
        },
        "package_versions": {p: version(p) for p in (
            "numpy", "pandas", "scipy", "scikit-learn", "joblib", "matplotlib")},
        "python_version": python_version(),
    }
    bundle = {"model": model, "preprocessor": preprocessor,
              "score_reference": reference, "metadata": metadata}
    validate_bundle(bundle)
    return bundle


def validate_bundle(bundle):
    meta = bundle["metadata"]
    features = meta.get("expected_raw_features", [])
    reference = np.asarray(bundle["score_reference"])
    if (meta.get("bundle_format_version") != 1 or not features
            or len(features) != len(set(features)) or EXCLUDED.intersection(features)
            or meta.get("threshold") != THRESHOLD
            or not meta.get("model_version") or not meta.get("package_versions")
            or reference.ndim != 1 or reference.size == 0
            or not np.isfinite(reference).all() or (np.diff(reference) < 0).any()
            or reference.size != meta["benign_training_rows"]
            or reference.size != meta["score_reference"]["count"]):
        raise ValueError("Invalid anomaly bundle metadata or score reference")
    json.dumps(meta, allow_nan=False)
    check_is_fitted(bundle["preprocessor"])
    check_is_fitted(bundle["model"])
    if list(bundle["preprocessor"].feature_names_in_) != features:
        raise ValueError("Bundle feature schema disagrees with preprocessor")


def save_bundle(bundle, path=BUNDLE_PATH):
    validate_bundle(bundle)
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("xb") as target:
        joblib.dump(bundle, target, compress=3)


def load_bundle(path=BUNDLE_PATH):
    """Only deserialize trusted local artifacts; joblib can execute code."""
    path = Path(path).resolve()
    if not path.is_relative_to(MODELS_DIR.resolve()) or path.suffix != ".joblib":
        raise ValueError("Only trusted local models/*.joblib may be loaded")
    bundle = joblib.load(path)
    validate_bundle(bundle)
    return bundle


def predict(events, bundle):
    validate_bundle(bundle)
    single = isinstance(events, Mapping)
    if not single and not isinstance(events, pd.DataFrame):
        raise TypeError("Expected event mapping or pandas DataFrame")
    frame = pd.DataFrame([dict(events)]) if single else events
    if not frame.columns.is_unique:
        raise ValueError("Duplicate feature names")
    features = bundle["metadata"]["expected_raw_features"]
    missing = set(features).difference(frame.columns)
    if missing:
        raise ValueError(f"Missing required features: {sorted(missing)}")
    if frame.empty:
        raise ValueError("At least one event is required")
    transformed = bundle["preprocessor"].transform(frame.loc[:, features])
    raw = -bundle["model"].score_samples(transformed)
    if not np.isfinite(raw).all():
        raise ValueError("Non-finite anomaly scores")
    reference = bundle["score_reference"]
    scores = np.searchsorted(reference, raw, side="right") / len(reference)
    meta = bundle["metadata"]
    results = [{
        "predicted_anomaly": bool(score > meta["threshold"]),
        "anomaly_score": float(score), "anomaly_risk_score": float(score * 100),
        "threshold": meta["threshold"], "model_version": meta["model_version"],
        "scoring_explanation": meta["scoring_explanation"],
    } for score in scores]
    return results[0] if single else results
