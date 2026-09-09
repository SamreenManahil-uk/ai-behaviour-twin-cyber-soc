"""Fast synthetic checks; official training is never invoked by tests."""

import json
import sys
from pathlib import Path
from unittest.mock import patch

import numpy as np
import pandas as pd
import pytest
from sklearn.ensemble import IsolationForest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from cyber_soc_ml.anomaly import (
    PARAMETERS,
    build_model,
    fit_bundle,
    load_bundle,
    predict,
    save_bundle,
    validate_bundle,
)
from cyber_soc_ml.preprocessing import build_preprocessor


def training_data():
    rng = np.random.default_rng(42)
    X = pd.DataFrame({"bytes": np.r_[rng.normal(0, 0.2, 128), [99999.] * 8],
                      "proto": ["tcp"] * 128 + ["attack-only"] * 8})
    return X, pd.Series([0] * 128 + [1] * 8)


@pytest.fixture
def bundle():
    X, y = training_data()
    with patch("cyber_soc_ml.anomaly.build_model", return_value=IsolationForest(
        **(PARAMETERS | {"n_estimators": 30, "max_samples": 64})
    )):
        return fit_bundle(X, y)


def test_benign_only_preprocessing_and_fit():
    X, y = training_data()
    model = IsolationForest(**(PARAMETERS | {"n_estimators": 3, "max_samples": 64}))
    with patch("cyber_soc_ml.anomaly.build_preprocessor", wraps=build_preprocessor) as prep, \
            patch("cyber_soc_ml.anomaly.build_model", return_value=model), \
            patch.object(model, "fit", wraps=model.fit) as fit:
        result = fit_bundle(X, y)
    pd.testing.assert_frame_equal(prep.call_args.args[0], X.loc[y == 0])
    assert len(fit.call_args.args) == 1 and not fit.call_args.kwargs
    assert fit.call_args.args[0].shape[0] == 128
    assert np.max(fit.call_args.args[0]) < 2
    categories = result["preprocessor"].named_transformers_["categorical"].named_steps[
        "encoder"].categories_[0]
    assert categories.tolist() == ["tcp"]
    assert result["metadata"]["benign_training_rows"] == 128


def test_configuration():
    assert all(build_model().get_params()[k] == v for k, v in PARAMETERS.items())
    assert PARAMETERS["random_state"] == 42
    assert PARAMETERS["n_estimators"] == 100 and PARAMETERS["max_samples"] == 256
    assert PARAMETERS["n_jobs"] == 1 and not PARAMETERS["warm_start"]


@pytest.mark.parametrize("column", ["id", "label", "attack_cat"])
def test_leakage_rejected(column):
    X, y = training_data()
    with pytest.raises(ValueError, match="must exclude"):
        fit_bundle(X.assign(**{column: 1}), y)


def test_direction_ranges_and_extra_fields(bundle):
    normal = {"bytes": 0., "proto": "tcp"}
    unusual = {"bytes": 10000., "proto": "tcp"}
    a, b = predict(pd.DataFrame([normal, unusual]), bundle)
    assert b["anomaly_score"] > a["anomaly_score"]
    assert b["predicted_anomaly"] is True
    for event, result in ((normal, a), (unusual, b)):
        assert 0 <= result["anomaly_score"] <= 1
        assert 0 <= result["anomaly_risk_score"] <= 100
        assert result["anomaly_risk_score"] == result["anomaly_score"] * 100
        assert result["predicted_anomaly"] == (result["anomaly_score"] > result["threshold"])
        assert "not a calibrated attack" in result["scoring_explanation"]
        for label in (0, 1):
            assert predict(event | {"id": 123, "label": label, "attack_cat": "x"}, bundle) == result
        json.dumps(result, allow_nan=False)


def test_ecdf_ties_and_endpoints(bundle):
    reference = bundle["score_reference"]
    raw = np.array([reference[0] - 1, reference[64], reference[-1] + 1])
    with patch.object(bundle["model"], "score_samples", return_value=-raw):
        results = predict(pd.DataFrame({"bytes": [0.] * 3, "proto": ["tcp"] * 3}), bundle)
    assert results[0]["anomaly_score"] == 0
    assert results[1]["anomaly_score"] == float((reference <= reference[64]).mean())
    assert results[2]["anomaly_score"] == 1


def test_missing_duplicate_empty(bundle):
    with pytest.raises(ValueError, match="Missing required features.*bytes"):
        predict({"proto": "tcp"}, bundle)
    with pytest.raises(ValueError, match="Duplicate"):
        predict(pd.DataFrame([[1, 2]], columns=["bytes", "bytes"]), bundle)
    with pytest.raises(ValueError, match="At least one"):
        predict(pd.DataFrame(columns=["bytes", "proto"]), bundle)


def test_roundtrip_metadata_and_overwrite(bundle, tmp_path, monkeypatch):
    monkeypatch.setattr("cyber_soc_ml.anomaly.MODELS_DIR", tmp_path)
    path = tmp_path / "synthetic.joblib"
    save_bundle(bundle, path)
    restored = load_bundle(path)
    event = {"bytes": 0., "proto": "tcp"}
    assert predict(event, restored) == predict(event, bundle)
    np.testing.assert_array_equal(restored["score_reference"], bundle["score_reference"])
    meta = restored["metadata"]
    assert meta["random_seed"] == 42 and meta["threshold"] == 0.95
    assert meta["training_methodology"] and meta["package_versions"]["scikit-learn"]
    assert meta["score_reference"]["source"] == "benign official training rows only"
    assert json.loads(json.dumps(meta, allow_nan=False)) == meta
    with pytest.raises(FileExistsError):
        save_bundle(bundle, path)
    meta["training_duration_seconds"]["total"] = float("nan")
    with pytest.raises(ValueError):
        validate_bundle(restored)


def test_invalid_reference_and_labels(bundle):
    bundle["score_reference"][0] = np.nan
    with pytest.raises(ValueError, match="reference"):
        validate_bundle(bundle)
    X, y = training_data()
    for labels in ([1] * len(y), [2] * len(y), y.iloc[:-1], y.iloc[::-1]):
        with pytest.raises(ValueError):
            fit_bundle(X, labels)


def test_external_bundle_rejected(tmp_path):
    with patch("cyber_soc_ml.anomaly.joblib.load") as loader:
        with pytest.raises(ValueError, match="trusted local"):
            load_bundle(tmp_path / "external.joblib")
        loader.assert_not_called()
