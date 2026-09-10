"""Simulated hybrid-risk examples; no model loading or endpoint action."""

import json

from cyber_soc_ml.risk_engine import score_risk


def main():
    benign = score_risk(
        supervised_threat_score=0.05,
        anomaly_score=0.02,
        behaviour_deviation=0.03,
        rule_score=0.0,
    )
    suspicious = score_risk(
        supervised_threat_score=0.93,
        anomaly_score=0.88,
        behaviour_deviation=0.91,
        rule_score=0.85,
        rule_evidence=[
            "Repeated authentication failures",
            "Encoded PowerShell command observed",
            "New destination IP observed",
        ],
    )
    print(json.dumps({"simulated": True, "benign": benign, "suspicious": suspicious},
                     allow_nan=False, indent=2))


if __name__ == "__main__":
    main()
