# Simulated endpoint Behaviour Twin

This standalone component accepts caller-supplied simulated endpoint events. It
collects no telemetry and performs no endpoint actions. It does not integrate
with network models or hybrid risk scoring. No Behaviour Twin dataset validation
has been performed.

`EndpointEvent` is a frozen validated record containing endpoint_id, user_id,
timestamp, successful_login, failed_login_count, process_name, powershell_used,
encoded_command, file_access_count, outbound_bytes, destination_ip and
privilege_event. Flags must be booleans; counts must be integers in [0, 10^15].
Identity/process strings must be nonblank and at most 256 characters. IPs must be
literal IPv4/IPv6 addresses (canonicalized without DNS). ISO timestamps require
an explicit offset and are compared in UTC.

Build with `BehaviourTwin.build(history, generated_timestamp=..., minimum_history=20,
usual_frequency=0.05)`. The minimum is configurable but must be at least two.
All history must belong to one endpoint/user and strictly precede the explicit
generation timestamp. The caller is responsible for selecting simulated normal
history; labels are not accepted. At least one successful login is required.
The frozen profile records sample count, minimum size, history end, generation
time, schema version 1, profile version endpoint-behaviour-v1 and learned values.
Scoring accepts only matching identities with timestamps at or after generation.
It never updates the baseline. Rebuild explicitly when a new baseline is wanted.

Successful login hours are stored as sorted unique fractional UTC hours. Distance
to the nearest observed successful login hour uses the shorter circular distance
around a 24-hour clock. A one-hour tolerance scores zero, then deviation rises
linearly to one at six hours. Thus 23:30 and 00:15 are close. Events without a
successful login receive zero login-time signal. This supports multiple normal
login windows, but sparse history and outlier login times may broaden acceptance;
there is no weekday, seasonal or local daylight-saving model.

Numeric baselines store median and median absolute deviation (MAD), in the order
failed logins, file accesses, outbound bytes. Effective scale is
`max(1.4826 * MAD, 1, 0.1 * median)`. For value x, score is
`clamp(((x - median) / scale - 3) / 6, 0, 1)`. Only upward deviations contribute.
This gives robust outlier resistance and safe constant baselines. Counts/bytes
must represent comparable observation intervals; interval normalization is the
caller's responsibility.

Usual processes and IPs have occurrence frequency >= usual_frequency. Sets are
sorted deterministically; process names are case-sensitive. Values outside these
sets score one (including historically seen but infrequent values). PowerShell
scores `clamp(1 - historical_frequency / usual_frequency, 0, 1)` when used and zero
otherwise. Encoded-command and privilege flags each score one when present; these
are explicit policy signals even if observed historically.

| Signal | Weight |
| --- | ---: |
| Unusual successful login time | 0.10 |
| Excessive failed logins | 0.15 |
| Unusual process | 0.10 |
| Rare PowerShell | 0.10 |
| Encoded command | 0.15 |
| Abnormal file access | 0.10 |
| Abnormal outbound bytes | 0.15 |
| New/infrequent destination IP | 0.05 |
| Privilege activity | 0.10 |

The fixed weights are validated as finite, nonnegative and summing to one.
`score(event)` returns deterministic signal_scores, behaviour_deviation (weighted
sum clamped to [0, 1]), behaviour_risk_score (deviation times 100), and readable
evidence only for signals >= 0.2. These heuristic values are not attack
probabilities or calibrated risk estimates. A deviation can have benign causes.

`profile.save(path)` and `BehaviourTwin.load(path)` use caller-selected local UTF-8
JSON files only. Saving overwrites the specified file. Loading rejects unknown or
missing fields, incompatible versions, duplicate keys, nonfinite constants,
invalid ranges and malformed collections. JSON never invokes executable/pickle
deserialization. Files are not authenticated; use only appropriately controlled
profile paths. Persistence is the only component operation that accesses files.

Run the small deterministic in-memory fictional Windows demonstration:

```sh
ml-service/.venv/bin/python ml-service/scripts/behaviour_twin_example.py
```

It prints a normal event and a suspicious 02:00 UTC event with repeated failures,
encoded PowerShell, an unusual documentation-range IP, elevated file/outbound
activity and a privilege flag. It writes no dataset and accesses no real endpoint
telemetry. Tests cover history boundaries, identities, circular hours, robust and
constant baselines, frequency rules, evidence, determinism, score ranges, JSON,
weights, validation and guarded absence of system access during build/score.
