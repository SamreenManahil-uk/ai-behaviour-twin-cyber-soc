"""Synthetic inference boundaries, serialization trust and score semantics."""

from unittest.mock import patch

import pandas as pd
import pytest
from cyber_soc_ml.prediction import load_bundle, predict, validate_bundle
from test_modeling import synthetic_bundle


@pytest.fixture
def bundle():
    return synthetic_bundle()[2]


def test_output_and_extra_fields_cannot_affect_prediction(bundle):
    event = {"bytes": 1., "proto": "tcp"}
    result = predict(event, bundle)
    assert set(result) == {"predicted_label", "predicted_class", "model_score",
                           "network_risk_score", "threshold", "model_version"}
    assert 0 <= result["model_score"] <= 1
    assert 0 <= result["network_risk_score"] <= 100
    assert result["network_risk_score"] == result["model_score"] * 100
    assert result["predicted_label"] == int(result["model_score"] >= 0.5)
    assert result["predicted_class"] == ("attack" if result["predicted_label"] else "normal")
    assert result["threshold"] == 0.5
    for label in (0, 1):
        extras = event | {"label": label, "attack_cat": "anything", "id": 999, "extra": object()}
        assert predict(extras, bundle) == result
    assert predict(pd.DataFrame([event, event])[['proto', 'bytes']], bundle) == [result, result]


def test_missing_and_duplicate_features(bundle):
    with pytest.raises(ValueError, match="Missing required features.*bytes"):
        predict({"proto": "tcp", "label": 1}, bundle)
    with pytest.raises(ValueError, match="Duplicate"):
        predict(pd.DataFrame([[1, 2, "tcp"]], columns=["bytes", "bytes", "proto"]), bundle)
    with pytest.raises(ValueError, match="At least one"):
        predict(pd.DataFrame(columns=["bytes", "proto"]), bundle)


def test_external_path_rejected_before_deserialization(tmp_path):
    with patch("cyber_soc_ml.prediction.joblib.load") as loader:
        with pytest.raises(ValueError, match="trusted local"):
            load_bundle(tmp_path / "external.joblib")
        loader.assert_not_called()


def test_leaky_bundle_rejected(bundle):
    bundle["metadata"]["expected_raw_features"].append("label")
    with pytest.raises(ValueError, match="metadata"):
        validate_bundle(bundle)
