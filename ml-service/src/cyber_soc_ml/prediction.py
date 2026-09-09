"""Inference from trusted local bundles only; joblib is unsafe for untrusted files.

Extra fields (including id and targets) are ignored. Missing predictors and
ambiguous duplicate columns are rejected. Mapping input returns one dict;
DataFrame input returns a list of dicts in row order. Scores are uncalibrated
XGBoost outputs; scaling to 0–100 does not implement hybrid SOC risk scoring.
"""

from collections.abc import Mapping
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.utils.validation import check_is_fitted

from cyber_soc_ml.data import EXCLUDED
from cyber_soc_ml.modeling import BUNDLE_PATH, MODELS_DIR


def validate_bundle(bundle):
    if not isinstance(bundle, dict) or set(bundle) != {"preprocessor", "model", "metadata"}:
        raise ValueError("Invalid inference bundle structure")
    meta = bundle["metadata"]
    features = meta.get("expected_raw_features", [])
    if (meta.get("bundle_format_version") != 1 or not features
            or len(features) != len(set(features)) or EXCLUDED.intersection(features)
            or not meta.get("model_version") or not meta.get("package_versions")
            or meta.get("threshold") != 0.5):
        raise ValueError("Invalid inference bundle metadata")
    check_is_fitted(bundle["preprocessor"])
    check_is_fitted(bundle["model"])
    if list(bundle["preprocessor"].feature_names_in_) != features:
        raise ValueError("Bundle feature schema disagrees with fitted preprocessor")
    if list(bundle["model"].classes_) != [0, 1]:
        raise ValueError("Bundle must use classes 0 and 1")


def load_bundle(path=BUNDLE_PATH):
    """Load only repository models/*.joblib that the caller knows are trusted.

    Path containment is not authentication: never copy an external/untrusted
    artifact here. Validation happens after deserialization and is not a sandbox.
    """
    path = Path(path).resolve()
    if not path.is_relative_to(MODELS_DIR.resolve()) or path.suffix != ".joblib":
        raise ValueError("Only trusted local .joblib files under models/ may be loaded")
    bundle = joblib.load(path)
    validate_bundle(bundle)
    return bundle


def predict(events, bundle):
    """Predict from raw features, preserving training feature order; ignore extras."""
    validate_bundle(bundle)
    single = isinstance(events, Mapping)
    if not single and not isinstance(events, pd.DataFrame):
        raise TypeError("Expected a raw event mapping or pandas DataFrame")
    frame = pd.DataFrame([dict(events)]) if single else events
    if not frame.columns.is_unique:
        raise ValueError("Duplicate feature names are not allowed")
    meta = bundle["metadata"]
    features = meta["expected_raw_features"]
    missing = set(features).difference(frame.columns)
    if missing:
        raise ValueError(f"Missing required features: {sorted(missing)}")
    if frame.empty:
        raise ValueError("At least one event is required")
    transformed = bundle["preprocessor"].transform(frame.loc[:, features])
    scores = bundle["model"].predict_proba(transformed)[:, 1]
    if not np.isfinite(scores).all() or ((scores < 0) | (scores > 1)).any():
        raise ValueError("Model returned invalid scores")
    results = []
    for value in scores:
        score = float(value)
        label = int(score >= meta["threshold"])
        results.append({
            "predicted_label": label, "predicted_class": "attack" if label else "normal",
            "model_score": score, "network_risk_score": score * 100,
            "threshold": meta["threshold"], "model_version": meta["model_version"],
        })
    return results[0] if single else results
