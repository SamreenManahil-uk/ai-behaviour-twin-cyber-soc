"""Training-only fitting and unrounded binary benchmark evaluation."""

from datetime import datetime, timezone
from importlib.metadata import version
from pathlib import Path
from platform import python_version
from time import perf_counter

import joblib
import numpy as np
from sklearn.dummy import DummyClassifier
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from xgboost import XGBClassifier

from cyber_soc_ml.preprocessing import build_preprocessor

MODEL_VERSION = "xgboost-network-v1"
MODELS_DIR = Path(__file__).resolve().parents[2] / "models"
BUNDLE_PATH = MODELS_DIR / f"{MODEL_VERSION}.joblib"
PARAMETERS = {
    "n_estimators": 200, "max_depth": 6, "learning_rate": 0.1,
    "min_child_weight": 1, "subsample": 1.0, "colsample_bytree": 1.0,
    "reg_lambda": 1.0, "reg_alpha": 0.0, "random_state": 42,
    "tree_method": "hist", "objective": "binary:logistic",
    "eval_metric": "logloss", "n_jobs": 1,
}
SCORE_NOTES = (
    "model_score is the XGBoost attack output score, not probability-calibrated. "
    "network_risk_score is model_score * 100, not the final hybrid SOC risk score."
)


def json_safe_metadata(value):
    """Copy nested metadata, spelling non-finite floats explicitly for strict JSON.

    Use only for metadata, never measured evaluation metrics: those must remain
    finite numeric values and fail strict serialization otherwise.
    """
    if isinstance(value, dict):
        return {key: json_safe_metadata(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [json_safe_metadata(item) for item in value]
    if isinstance(value, (float, np.floating)):
        if np.isnan(value):
            return "NaN"
        if np.isposinf(value):
            return "Infinity"
        if np.isneginf(value):
            return "-Infinity"
        return float(value)
    return value


def build_model():
    """Fixed modest configuration; no exhaustive optimisation or class weighting."""
    return XGBClassifier(**PARAMETERS)


def fit_bundle(X_train, y_train):
    """Fit preprocessing and the final model once; accepts no held-out split."""
    if len(X_train) != len(y_train) or set(np.asarray(y_train)) != {0, 1}:
        raise ValueError("Training requires aligned rows and both binary labels 0 and 1")
    start = perf_counter()
    preprocessor = build_preprocessor(X_train)
    transformed = preprocessor.fit_transform(X_train)
    preprocessing_seconds = perf_counter() - start
    model = build_model()
    start = perf_counter()
    model.fit(transformed, y_train)
    model_seconds = perf_counter() - start
    baseline = DummyClassifier(strategy="most_frequent", random_state=42)
    start = perf_counter()
    baseline.fit(np.zeros((len(y_train), 1)), y_train)
    baseline_seconds = perf_counter() - start
    metadata = {
        "bundle_format_version": 1, "model_version": MODEL_VERSION,
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "expected_raw_features": list(X_train.columns),
        "raw_feature_dtypes": {name: str(dtype) for name, dtype in X_train.dtypes.items()},
        "excluded_features": ["id", "attack_cat", "label"],
        "threshold": 0.5, "class_names": {"0": "normal", "1": "attack"},
        "training_rows": len(X_train), "transformed_features": transformed.shape[1],
        "parameters": model.get_params(),
        "package_versions": {p: version(p) for p in (
            "numpy", "pandas", "scipy", "scikit-learn", "xgboost", "joblib", "matplotlib"
        )},
        "python_version": python_version(),
        "training_duration_seconds": {
            "preprocessing_fit_transform": preprocessing_seconds,
            "xgboost_fit": model_seconds,
            "preprocessing_plus_xgboost": preprocessing_seconds + model_seconds,
            "dummy_fit": baseline_seconds,
        },
        "selection_protocol": (
            "200 depth-6 trees at learning rate 0.1 bound runtime and complexity. "
            "Fixed before fitting; no search, early stopping, feature selection, "
            "resampling, SMOTE, class weights or test-based decisions. "
            "Threshold fixed at 0.5; all official training rows used once."
        ),
        "score_notes": SCORE_NOTES,
        "unexpected_fields": "Ignored: only expected_raw_features are selected in order.",
    }
    return {"preprocessor": preprocessor, "model": model, "metadata": metadata}, baseline


def save_bundle(bundle, path=BUNDLE_PATH):
    """Save a trusted local artifact; refuse to overwrite a version already trained."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("xb") as target:
        joblib.dump(bundle, target, compress=3)


def evaluate_scores(y_true, scores, threshold=0.5):
    """Positive class is attack=1. AP is average precision, not trapezoidal PR area.

    Keep raw floating-point values; display formatting belongs to consumers.
    Undefined precision in a never-predicted class is reported as zero.
    """
    scores = np.asarray(scores, dtype=float)
    if scores.ndim != 1 or len(scores) != len(y_true):
        raise ValueError("Scores must be one-dimensional and aligned with labels")
    if not np.isfinite(scores).all() or ((scores < 0) | (scores > 1)).any():
        raise ValueError("Scores must be finite and between 0 and 1")
    predicted = (scores >= threshold).astype(int)
    return {
        "accuracy": accuracy_score(y_true, predicted),
        "precision": precision_score(y_true, predicted, zero_division=0),
        "recall": recall_score(y_true, predicted, zero_division=0),
        "f1": f1_score(y_true, predicted, zero_division=0),
        "roc_auc": roc_auc_score(y_true, scores),
        "average_precision": average_precision_score(y_true, scores),
        "confusion_matrix": confusion_matrix(y_true, predicted, labels=[0, 1]).tolist(),
        "classification_report": classification_report(
            y_true, predicted, labels=[0, 1], target_names=["normal", "attack"],
            output_dict=True, zero_division=0,
        ),
        "prediction_counts": {str(i): int((predicted == i).sum()) for i in (0, 1)},
    }
