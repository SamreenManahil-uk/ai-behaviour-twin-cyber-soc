# Rule-Based Detection and MITRE Mapping

This component evaluates validated simulated endpoint-event JSON using a small,
deterministic and explainable rule set.

It detects declared encoded-command activity, PowerShell use, repeated failed
logins, selected Windows proxy-execution binaries, privilege activity and large
outbound transfers.

Each rule has an explicit risk contribution and MITRE ATT&CK mapping. Combined
scores are capped from zero to one hundred. They are heuristic risk scores, not
calibrated attack probabilities.

The detector parses strict JSON but never executes payload content. Wrongly
typed values are ignored instead of being coerced into detections. Dataset
labels, future events, test results and ML scores are not used.

The current rules are a portfolio demonstration. They require tuning,
environment-specific allowlists, suppression logic and validation against
representative organisational telemetry before production use.

## Ingestion integration

During API event ingestion, the event is evaluated before persistence. A benign
event creates no alert. A matching event and its single rule alert are committed
in one PostgreSQL transaction. Only after commit does the service attempt a
safe SignalR `AlertCreated` broadcast.

PostgreSQL remains the source of truth. Real-time delivery is best effort in
this portfolio implementation. A production system should use a transactional
outbox and message broker to guarantee eventual notification delivery.

