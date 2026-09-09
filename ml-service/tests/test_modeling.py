"""Small synthetic model fits; no raw dataset dependency."""

import json
import sys
from pathlib import Path
from unittest.mock import patch

import numpy as np
import pandas as pd
import pytest
from xgboost import XGBClassifier

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from cyber_soc_ml.modeling import (
    PARAMETERS,
    build_model,
    evaluate_scores,
    fit_bundle,
    json_safe_metadata,
    save_bundle,
)
from cyber_soc_ml.prediction import load_bundle


def synthetic_bundle():
    X = pd.DataFrame({"bytes": [0., 1., 2., 3., 8., 9., 10., 11.],
                      "proto": ["tcp"] * 4 + ["udp"] * 4})
    y = pd.Series([0] * 4 + [1] * 4)
    with patch("cyber_soc_ml.modeling.build_model", return_value=XGBClassifier(
        **(PARAMETERS | {"n_estimators": 3, "max_depth": 2})
    )):
        bundle, dummy = fit_bundle(X, y)
    return X, y, bundle, dummy


def test_deterministic_configuration():
    p = build_model().get_params()
    assert all(p[k] == v for k, v in PARAMETERS.items())
    assert p["random_state"] == 42 and p["tree_method"] == "hist"
    assert p["objective"] == "binary:logistic" and p["eval_metric"] == "logloss"
    assert p["scale_pos_weight"] is None and p["early_stopping_rounds"] is None


@pytest.mark.parametrize("column", ["id", "label", "attack_cat"])
def test_training_rejects_leakage(column):
    with pytest.raises(ValueError, match="must exclude"):
        fit_bundle(pd.DataFrame({"bytes": [1., 2.], column: [0, 1]}), [0, 1])


def test_bundle_roundtrip_and_training_statistics(tmp_path, monkeypatch):
    X, _y, bundle, dummy = synthetic_bundle()
    monkeypatch.setattr("cyber_soc_ml.prediction.MODELS_DIR", tmp_path)
    path = tmp_path / "synthetic.joblib"
    save_bundle(bundle, path)
    restored = load_bundle(path)
    assert set(restored) == {"model", "preprocessor", "metadata"}
    meta = restored["metadata"]
    assert meta["expected_raw_features"] == list(X)
    assert meta["threshold"] == 0.5 and meta["bundle_format_version"] == 1
    assert meta["model_version"] and meta["created_at_utc"]
    assert set(meta["package_versions"]) >= {"xgboost", "scikit-learn", "joblib"}
    assert all(v >= 0 for v in meta["training_duration_seconds"].values())
    transformer = restored["preprocessor"]
    assert transformer.named_transformers_["numeric"].named_steps["imputer"].statistics_ == [5.5]
    transformer.transform(pd.DataFrame({"bytes": [99999.], "proto": ["unseen"]}))
    assert transformer.named_transformers_["categorical"].named_steps[
        "encoder"].categories_[0].tolist() == ["tcp", "udp"]
    np.testing.assert_array_equal(bundle["model"].predict_proba(transformer.transform(X)),
                                  restored["model"].predict_proba(transformer.transform(X)))
    assert dummy.strategy == "most_frequent"
    with pytest.raises(FileExistsError):
        save_bundle(bundle, path)


def test_metrics_from_known_predictions():
    result = evaluate_scores([0, 0, 1, 1], [0.1, 0.7, 0.4, 0.9])
    assert result["confusion_matrix"] == [[1, 1], [1, 1]]
    assert result["accuracy"] == result["precision"] == result["recall"] == result["f1"] == 0.5
    assert result["roc_auc"] == 0.75
    assert result["average_precision"] == pytest.approx(5 / 6)
    assert result["prediction_counts"] == {"0": 2, "1": 2}
    assert result["classification_report"]["attack"]["support"] == 2
    assert evaluate_scores([0, 1], [0.5, 0.5])["prediction_counts"] == {"0": 0, "1": 2}


def test_nested_json_safe_metadata_preserves_finite_values():
    finite = 0.12345678901234568
    original = {"nested": [{"nan": float("nan"), "pos": float("inf")},
                           [float("-inf"), finite, np.float32(2.5)]],
                "unchanged": [None, True, 42, "text"]}
    safe = json_safe_metadata(original)
    assert safe == {"nested": [{"nan": "NaN", "pos": "Infinity"},
                               ["-Infinity", finite, 2.5]],
                    "unchanged": [None, True, 42, "text"]}
    assert json.loads(json.dumps(safe, allow_nan=False)) == safe
    assert np.isnan(original["nested"][0]["nan"])
    assert original["nested"][1][0] == float("-inf")


def test_report_only_sanitizes_metadata():
    sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
    from train_xgboost import build_report

    metrics = evaluate_scores([0, 1], [0.1, 0.9])
    with patch("pathlib.Path.read_bytes", return_value=b"synthetic"), patch(
        "pathlib.Path.stat"
    ) as stat:
        stat.return_value.st_size = 9
        report = build_report({"metadata": {"missing": float("nan")}}, 2, metrics, metrics)
    assert report["metadata"]["missing"] == "NaN"
    assert report["xgboost"] is metrics
    json.dumps(report, allow_nan=False)
    metrics["accuracy"] = float("nan")
    with pytest.raises(ValueError, match="Out of range float"):
        json.dumps(report, allow_nan=False)
