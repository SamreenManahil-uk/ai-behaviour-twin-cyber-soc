"""Tests for pure deterministic hybrid risk fusion."""

import json
import math
from unittest.mock import patch

import pytest
from cyber_soc_ml.risk_engine import (
    SCORING_VERSION,
    WEIGHTS,
    HybridRiskEngine,
    score_risk,
    validate_weights,
)


def test_exact_weighted_score_and_structure():
    result = score_risk(0.8, 0.4, 0.6, 0.2)
    expected = 0.8 * 0.45 + 0.4 * 0.20 + 0.6 * 0.25 + 0.2 * 0.10
    assert result["risk_score"] == pytest.approx(expected * 100)
    assert result["severity"] == "High"
    assert result["component_scores"] == {
        "supervised_threat_score": 0.8,
        "anomaly_score": 0.4,
        "behaviour_deviation": 0.6,
        "rule_score": 0.2,
    }
    assert result["weighted_contributions"]["supervised_threat_score"] == pytest.approx(0.36)
    assert result["scoring_version"] == SCORING_VERSION


@pytest.mark.parametrize(("value", "severity"), [
    (0.0, "Low"), (0.249999, "Low"), (0.25, "Medium"),
    (0.499999, "Medium"), (0.5, "High"), (0.749999, "High"),
    (0.75, "Critical"), (1.0, "Critical"),
])
def test_severity_boundaries(value, severity):
    assert score_risk(value, value, value, value)["severity"] == severity


def test_ranges_zero_signal_and_determinism():
    result = score_risk(0, 0, 0, 0)
    assert result["risk_score"] == 0
    assert result["severity"] == "Low"
    assert result["evidence"] == []
    assert score_risk(0.7, 0.2, 0.9, 0.4) == score_risk(0.7, 0.2, 0.9, 0.4)
    assert 0 <= result["risk_score"] <= 100
    assert all(0 <= value <= 1 for value in result["component_scores"].values())
    assert all(0 <= value <= 0.45 for value in result["weighted_contributions"].values())


def test_dominant_signal_and_explanation():
    result = score_risk(0.9, 0.1, 0.2, 0.1)
    assert result["dominant_signal"] == "supervised_threat_score"
    assert "supervised_threat_score" in result["explanation"]
    # Ties resolve in documented input order.
    assert score_risk(0, 1, 0, 0)["dominant_signal"] == "anomaly_score"


def test_evidence_generation_and_deduplication():
    result = score_risk(0.7, 0.0, 0.3, 0.0,
                        [" Rule finding ", "Rule finding", "Other finding"])
    assert result["evidence"] == [
        "Elevated supervised threat signal.",
        "Elevated Behaviour Twin deviation.",
        "Rule finding",
        "Other finding",
    ]
    assert score_risk(0.1, 0.1, 0.1, 0.1, ["finding"])["evidence"] == ["finding"]


@pytest.mark.parametrize("value", [True, False, "0.5", -0.01, 1.01, float("nan"), float("inf")])
def test_invalid_component_values_rejected(value):
    with pytest.raises(ValueError):
        score_risk(value, 0, 0, 0)


@pytest.mark.parametrize("evidence", ["finding", [""], ["   "], [1], [None], ["x" * 513], {"finding"}])
def test_malformed_rule_evidence_rejected(evidence):
    with pytest.raises((ValueError, TypeError)):
        score_risk(0, 0, 0, 0, evidence)


def test_inputs_not_mutated():
    findings = ["one", "one", "two"]
    before = findings.copy()
    score_risk(0.2, 0.3, 0.4, 0.5, findings)
    assert findings == before


def test_weights_and_facade():
    validate_weights()
    assert sum(WEIGHTS.values()) == pytest.approx(1.0)
    with pytest.raises(ValueError):
        validate_weights(dict(WEIGHTS) | {"rule_score": 0.2})
    assert HybridRiskEngine.score(supervised_threat_score=0, anomaly_score=0,
                                  behaviour_deviation=0, rule_score=0)["risk_score"] == 0
    with pytest.raises(ValueError):
        HybridRiskEngine.score(supervised_threat_score=0, anomaly_score=0,
                               behaviour_deviation=0)


def test_strict_json_and_no_system_access():
    with patch("builtins.open", side_effect=AssertionError("filesystem")), \
         patch("socket.socket", side_effect=AssertionError("network")), \
         patch("subprocess.Popen", side_effect=AssertionError("process")), \
         patch("os.system", side_effect=AssertionError("command")):
        result = score_risk(0.1, 0.2, 0.3, 0.4, ["simulated rule"])
    json.dumps(result, allow_nan=False)
    assert all(math.isfinite(value) for value in result["component_scores"].values())
