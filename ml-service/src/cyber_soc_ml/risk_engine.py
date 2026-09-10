"""Deterministic fusion of already-produced security signals.

This module does not load models, inspect endpoints, or estimate probabilities.
Its output is a prioritisation score for signals describing one event/context.
"""

import math
from types import MappingProxyType

SCORING_VERSION = "hybrid-risk-v1"
SIGNALS = (
    "supervised_threat_score",
    "anomaly_score",
    "behaviour_deviation",
    "rule_score",
)
WEIGHTS = MappingProxyType({
    "supervised_threat_score": 0.45,
    "anomaly_score": 0.20,
    "behaviour_deviation": 0.25,
    "rule_score": 0.10,
})
_EVIDENCE_THRESHOLD = 0.25


def validate_weights(weights=WEIGHTS):
    """Validate the explicit fusion weights before use."""
    if set(weights) != set(SIGNALS):
        raise ValueError("Weights must contain exactly the four risk signals")
    if any(type(value) not in (int, float) or not math.isfinite(value) or value < 0
           for value in weights.values()):
        raise ValueError("Weights must be finite and nonnegative")
    if not math.isclose(sum(weights.values()), 1.0, rel_tol=0, abs_tol=1e-12):
        raise ValueError("Risk weights must sum to one")


validate_weights()


def _signal_value(name, value):
    if type(value) not in (int, float) or not math.isfinite(value) or not 0 <= value <= 1:
        raise ValueError(f"{name} must be a finite number from 0 to 1")
    return float(value)


def _rule_evidence(value):
    if value is None:
        return ()
    if not isinstance(value, list):
        raise TypeError("rule_evidence must be a list of non-empty strings")
    findings = []
    seen = set()
    for finding in value:
        if not isinstance(finding, str) or not finding.strip() or len(finding) > 512:
            raise ValueError("Each rule finding must be non-empty text of at most 512 characters")
        finding = finding.strip()
        if finding not in seen:
            seen.add(finding)
            findings.append(finding)
    return tuple(findings)


def _severity(score):
    if score < 25:
        return "Low"
    if score < 50:
        return "Medium"
    if score < 75:
        return "High"
    return "Critical"


def _component_evidence(scores):
    descriptions = {
        "supervised_threat_score": "Elevated supervised threat signal.",
        "anomaly_score": "Elevated anomaly signal.",
        "behaviour_deviation": "Elevated Behaviour Twin deviation.",
        "rule_score": "Elevated deterministic rule signal.",
    }
    return [descriptions[name] for name in SIGNALS if scores[name] >= _EVIDENCE_THRESHOLD]


def score_risk(
    supervised_threat_score,
    anomaly_score,
    behaviour_deviation,
    rule_score,
    rule_evidence=None,
):
    """Fuse four scores for one event/context into an explainable risk result.

    Inputs are outputs from other components; none is treated as a calibrated
    probability. The returned risk score is a prioritisation value from 0 to 100.
    """
    values = {
        "supervised_threat_score": _signal_value(
            "supervised_threat_score", supervised_threat_score),
        "anomaly_score": _signal_value("anomaly_score", anomaly_score),
        "behaviour_deviation": _signal_value("behaviour_deviation", behaviour_deviation),
        "rule_score": _signal_value("rule_score", rule_score),
    }
    findings = _rule_evidence(rule_evidence)
    contributions = {name: values[name] * WEIGHTS[name] for name in SIGNALS}
    hybrid_score = math.fsum(contributions.values())
    risk_score = max(0.0, min(100.0, hybrid_score * 100))
    dominant = max(SIGNALS, key=lambda name: (contributions[name], -SIGNALS.index(name)))
    evidence = _component_evidence(values)
    for finding in findings:
        if finding not in evidence:
            evidence.append(finding)
    explanation = (
        f"Risk prioritisation score {risk_score:.2f}/100 ({_severity(risk_score)}). "
        f"The largest weighted contribution came from {dominant} "
        f"({contributions[dominant]:.4f})."
    )
    return {
        "risk_score": risk_score,
        "severity": _severity(risk_score),
        "component_scores": values,
        "weighted_contributions": contributions,
        "dominant_signal": dominant,
        "evidence": evidence,
        "scoring_version": SCORING_VERSION,
        "explanation": explanation,
    }


class HybridRiskEngine:
    """Small stateless facade suitable for later API integration."""

    scoring_version = SCORING_VERSION
    weights = WEIGHTS

    @staticmethod
    def score(**signals):
        required = set(SIGNALS)
        if set(signals) - required - {"rule_evidence"} != set() or not required <= set(signals):
            raise ValueError("All four component scores are required")
        return score_risk(**signals)


calculate_hybrid_risk = score_risk
