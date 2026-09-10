"""Only small in-memory simulated events and temporary profile JSON files."""

import json
from dataclasses import asdict, replace
from unittest.mock import patch

import pytest
from cyber_soc_ml.behaviour_twin import (
    WEIGHTS,
    BehaviourTwin,
    EndpointEvent,
    validate_weights,
)


@pytest.fixture
def event():
    return EndpointEvent("fictional", "alice", "2026-01-25T10:00:00Z", True, 0,
                         "explorer.exe", False, False, 100, 10000, "192.0.2.10", False)


def history(event):
    return [replace(event, timestamp=f"2026-01-{day:02d}T10:00:00Z") for day in range(1, 25)]


def build(events, **kwargs):
    return BehaviourTwin.build(events, generated_timestamp="2026-01-25T00:00:00Z", **kwargs)


def test_history_only_and_frozen(event):
    events = history(event)
    twin = build(events)
    before = asdict(twin)
    twin.score(replace(event, outbound_bytes=10**12))
    events.clear()
    assert asdict(twin) == before
    assert twin.numeric_baselines == ((0, 0), (100, 0), (10000, 0))
    for timestamp in ("2026-01-25T00:00:00Z", "2027-01-01T00:00:00Z"):
        with pytest.raises(ValueError, match="precede"):
            build(history(event) + [replace(event, timestamp=timestamp)])
    with pytest.raises(TypeError):
        EndpointEvent(**(asdict(event) | {"label": "normal"}))


@pytest.mark.parametrize("minimum", [1, True, 2.5, 25])
def test_minimum(event, minimum):
    with pytest.raises(ValueError, match="history"):
        build(history(event), minimum_history=minimum)


def test_mixed_and_current_identity(event):
    for name in ("endpoint_id", "user_id"):
        other = replace(event, **{name: "other"})
        with pytest.raises(ValueError, match="identity"):
            build(history(event)[:-1] + [replace(other, timestamp="2026-01-24T10:00:00Z")])
        with pytest.raises(ValueError, match="identity"):
            build(history(event)).score(other)


def test_circular_hours_and_timezone(event):
    events = [replace(e, timestamp=e.timestamp.replace("10:00", "23:30")) for e in history(event)]
    twin = build(events)
    assert twin.score(replace(event, timestamp="2026-01-26T00:15:00Z"))["signal_scores"]["login_time"] == 0
    assert twin.score(replace(event, timestamp="2026-01-26T01:15:00+01:00"))["signal_scores"]["login_time"] == 0
    assert twin.score(event)["signal_scores"]["login_time"] == 1
    assert twin.score(replace(event, successful_login=False))["signal_scores"]["login_time"] == 0
    with pytest.raises(ValueError, match="login history"):
        build([replace(e, successful_login=False) for e in events])


def test_robust_and_constant(event):
    events = history(event)
    events[0] = replace(events[0], file_access_count=10**12)
    twin = build(events)
    assert twin.numeric_baselines[1] == (100, 0)
    assert twin.score(event)["behaviour_deviation"] == 0
    for count, expected in [(0, 0), (130, 0), (160, 0.5), (190, 1), (10**15, 1)]:
        assert twin.score(replace(event, file_access_count=count))["signal_scores"]["file_access_count"] == expected
    varied = [replace(e, failed_login_count=i % 3) for i, e in enumerate(history(event))]
    assert build(varied).numeric_baselines[0] == (1, 1)


def test_normal_suspicious_ranges_and_determinism(event):
    twin = build(history(event))
    normal = twin.score(event)
    suspicious = replace(event, timestamp="2026-01-26T02:00:00Z", failed_login_count=30,
                         process_name="powershell.exe", powershell_used=True, encoded_command=True,
                         file_access_count=50000, outbound_bytes=10000000,
                         destination_ip="203.0.113.77", privilege_event=True)
    result = twin.score(suspicious)
    assert normal["behaviour_deviation"] < 0.1
    assert normal["evidence"] == []
    assert result["behaviour_deviation"] > normal["behaviour_deviation"] + 0.7
    assert len(result["evidence"]) == 9
    assert all(any(term in line for line in result["evidence"]) for term in
               ["login time", "failed logins", "process", "PowerShell", "Encoded", "file access",
                "outbound", "destination IP", "Privilege"])
    assert twin.score(suspicious) == result
    for output in (normal, result):
        assert 0 <= output["behaviour_deviation"] <= 1
        assert 0 <= output["behaviour_risk_score"] <= 100
        assert all(0 <= value <= 1 for value in output["signal_scores"].values())
        json.dumps(output, allow_nan=False)


def test_frequency_rules(event):
    events = history(event)
    events[0] = replace(events[0], process_name="rare.exe", destination_ip="203.0.113.1")
    twin = build(events)
    assert twin.usual_processes == ("explorer.exe",)
    assert twin.usual_destination_ips == ("192.0.2.10",)
    assert build(list(reversed(events))) == twin
    common_ps = build([replace(e, powershell_used=True) for e in events])
    assert common_ps.score(replace(event, powershell_used=True))["signal_scores"]["powershell_used"] == 0


def test_json_round_trip(event, tmp_path):
    twin = build(history(event))
    path = tmp_path / "profile.json"
    twin.save(path)
    loaded = BehaviourTwin.load(path)
    assert loaded == twin
    assert loaded.score(event) == twin.score(event)


@pytest.mark.parametrize("change", [
    {"schema_version": 2}, {"schema_version": True}, {"profile_version": "unknown"},
    {"sample_count": 0}, {"login_hours": [24]}, {"numeric_baselines": [[0, -1]] * 3},
    {"powershell_frequency": float("inf")}, {"usual_frequency": float("nan")},
    {"usual_processes": ["z", "a"]}, {"usual_destination_ips": ["invalid"]},
    {"extra": 1}, {"numeric_baselines": [None]}, {"login_hours": None},
])
def test_malformed_profile(event, tmp_path, change):
    path = tmp_path / "bad.json"
    path.write_text(json.dumps(asdict(build(history(event))) | change))
    with pytest.raises((ValueError, TypeError)):
        BehaviourTwin.load(path)


@pytest.mark.parametrize("payload", ['{"a": 1, "a": 2}', '[]', '{', '{"x": 1e999}', 'pickle'])
def test_strict_json(tmp_path, payload):
    path = tmp_path / "bad.json"
    path.write_text(payload)
    with pytest.raises(ValueError):
        BehaviourTwin.load(path)


@pytest.mark.parametrize("change", [
    {"failed_login_count": -1}, {"file_access_count": True}, {"outbound_bytes": float("nan")},
    {"outbound_bytes": 10**16}, {"successful_login": 1}, {"endpoint_id": ""},
    {"timestamp": "2026-01-01"}, {"destination_ip": "hostname.example"},
])
def test_event_validation(event, change):
    with pytest.raises(ValueError):
        replace(event, **change)


def test_weights():
    validate_weights(WEIGHTS)
    assert sum(WEIGHTS.values()) == pytest.approx(1)
    for value in (0, -1, float("nan"), True):
        with pytest.raises(ValueError):
            validate_weights(dict(WEIGHTS) | {"login_time": value})


def test_no_real_system_access(event):
    # Neither build nor score needs filesystem, network, commands, or environment.
    with patch("builtins.open", side_effect=AssertionError("file access")), \
         patch("pathlib.Path.open", side_effect=AssertionError("path access")), \
         patch("socket.socket", side_effect=AssertionError("network access")), \
         patch("subprocess.Popen", side_effect=AssertionError("process execution")), \
         patch("os.system", side_effect=AssertionError("command execution")), \
         patch("os.listdir", side_effect=AssertionError("directory access")), \
         patch("os.scandir", side_effect=AssertionError("directory access")), \
         patch("os.getenv", side_effect=AssertionError("environment access")):
        assert build(history(event)).score(event)["behaviour_deviation"] == 0


def test_current_timestamp_boundary(event):
    with pytest.raises(ValueError, match="precede"):
        build(history(event)).score(replace(event, timestamp="2026-01-24T12:00:00Z"))
