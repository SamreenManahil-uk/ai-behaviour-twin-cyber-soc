# Explainable hybrid cyber-risk engine

`cyber_soc_ml.risk_engine` is a pure fusion layer for already-produced security
signals. It does not train or load XGBoost, Isolation Forest, or Behaviour Twin
models, and it does not inspect an endpoint. The four inputs must describe the
same security event or investigation context before they are combined.

The engine validates each input as a finite, non-boolean number in `[0, 1]`:

| Signal | Weight |
| --- | ---: |
| `supervised_threat_score` | 0.45 |
| `anomaly_score` | 0.20 |
| `behaviour_deviation` | 0.25 |
| `rule_score` | 0.10 |

Weights are checked at import and before use to ensure they contain exactly these
signals and sum to one within a small floating-point tolerance. The formula is:

```text
hybrid_score = 0.45*supervised_threat_score
             + 0.20*anomaly_score
             + 0.25*behaviour_deviation
             + 0.10*rule_score
risk_score = clamp(hybrid_score * 100, 0, 100)
```

`risk_score` is a deterministic prioritisation/risk score, not a probability.
None of the component scores is treated or described as a calibrated probability
or attack probability. Severity is Low below 25, Medium from 25 to below 50,
High from 50 to below 75, and Critical from 75 through 100.

The result includes the validated component scores, each weighted contribution,
the dominant signal (largest contribution, with deterministic input-order tie
breaking), scoring version, an explanation, and evidence. Component evidence is
shown at signal values of at least 0.25. Supplied rule findings are stripped,
deduplicated in first-seen order, and included as provided; empty, non-text,
overlong, or otherwise malformed findings are rejected. The engine invents no
malware names, MITRE techniques, or endpoint actions.

The layer is intentionally stateless and independent of dataset schemas so it
can later be called by FastAPI or .NET. It does not mutate input lists and all
returned numbers are finite and JSON-safe. Run the simulated demonstration with:

```sh
PYTHONPATH=ml-service/src ml-service/.venv/bin/python ml-service/scripts/risk_engine_example.py
```

Signals can be correlated. For example, a supervised model, anomaly detector,
and Behaviour Twin may respond to the same underlying feature. Adding their
weighted contributions can therefore double-count evidence and over-prioritise
one event. Weights are explicit and explainable, but they are not calibrated
probabilities and have no dataset validation here. No temporal aggregation,
MITRE mapping, SOAR action, database, API, backend, or frontend integration is
implemented.
