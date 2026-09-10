"""Pure simulated endpoint profiling; no telemetry collection or endpoint actions."""

import json
import math
from collections import Counter
from dataclasses import asdict, dataclass, fields
from datetime import datetime
from ipaddress import ip_address
from pathlib import Path
from statistics import median
from types import MappingProxyType

SCHEMA_VERSION = 1
PROFILE_VERSION = "endpoint-behaviour-v1"
NUMERIC = ("failed_login_count", "file_access_count", "outbound_bytes")
WEIGHTS = MappingProxyType(dict(zip(
    ("login_time", "failed_login_count", "process_name", "powershell_used",
     "encoded_command", "file_access_count", "outbound_bytes", "destination_ip",
     "privilege_event"),
    (0.10, 0.15, 0.10, 0.10, 0.15, 0.10, 0.15, 0.05, 0.10), strict=True)))


def validate_weights(weights):
    if (set(weights) != set(WEIGHTS)
            or any(type(v) not in (int, float) or not math.isfinite(v) or v < 0
                   for v in weights.values())
            or not math.isclose(sum(weights.values()), 1.0, abs_tol=1e-12, rel_tol=0)):
        raise ValueError("Signal weights must be finite, nonnegative and sum to one")


validate_weights(WEIGHTS)


def _time(value):
    if not isinstance(value, str):
        raise TypeError("timestamp must be an ISO timestamp with UTC offset")
    try:
        result = datetime.fromisoformat(value)
    except ValueError as exc:
        raise ValueError("Invalid timestamp") from exc
    if result.utcoffset() is None:
        raise ValueError("timestamp requires a UTC offset")
    from datetime import timezone
    return result.astimezone(timezone.utc)


def _text(value):
    if not isinstance(value, str) or not value.strip() or len(value) > 256:
        raise ValueError("Expected nonempty text of at most 256 characters")


def _number(value, minimum=0, maximum=1e15):
    if (type(value) not in (int, float) or not math.isfinite(value)
            or not minimum <= value <= maximum):
        raise ValueError("Invalid finite numeric value")


@dataclass(frozen=True)
class EndpointEvent:
    endpoint_id: str
    user_id: str
    timestamp: str
    successful_login: bool
    failed_login_count: int
    process_name: str
    powershell_used: bool
    encoded_command: bool
    file_access_count: int
    outbound_bytes: int
    destination_ip: str
    privilege_event: bool

    def __post_init__(self):
        for name in ("endpoint_id", "user_id", "process_name"):
            _text(getattr(self, name))
        _time(self.timestamp)
        for name in ("successful_login", "powershell_used", "encoded_command", "privilege_event"):
            if type(getattr(self, name)) is not bool:
                raise ValueError(f"{name} must be boolean")
        for name in NUMERIC:
            value = getattr(self, name)
            _number(value)
            if type(value) is not int:
                raise ValueError(f"{name} must be an integer")
        if not isinstance(self.destination_ip, str):
            raise TypeError("destination_ip must be an IP literal")
        object.__setattr__(self, "destination_ip", str(ip_address(self.destination_ip)))


def _hour(event):
    dt = _time(event.timestamp)
    return dt.hour + dt.minute / 60 + dt.second / 3600 + dt.microsecond / 3.6e9


def _distance(a, b):
    return abs((a - b + 12) % 24 - 12)


def _cap(value):
    return max(0.0, min(1.0, value))


@dataclass(frozen=True)
class BehaviourTwin:
    endpoint_id: str
    user_id: str
    generated_timestamp: str
    history_end: str
    sample_count: int
    minimum_history: int
    usual_frequency: float
    login_hours: tuple
    numeric_baselines: tuple
    usual_processes: tuple
    usual_destination_ips: tuple
    powershell_frequency: float
    schema_version: int = SCHEMA_VERSION
    profile_version: str = PROFILE_VERSION

    def __post_init__(self):
        if type(self.schema_version) is not int or self.schema_version != SCHEMA_VERSION:
            raise ValueError("Incompatible schema version")
        if self.profile_version != PROFILE_VERSION:
            raise ValueError("Incompatible profile version")
        _text(self.endpoint_id)
        _text(self.user_id)
        if _time(self.history_end) >= _time(self.generated_timestamp):
            raise ValueError("History must precede profile generation")
        if (type(self.minimum_history) is not int or self.minimum_history < 2
                or type(self.sample_count) is not int or self.sample_count < self.minimum_history):
            raise ValueError("Invalid minimum history or sample count")
        _number(self.usual_frequency, 1e-9, 1)
        _number(self.powershell_frequency, 0, 1)
        for name in ("login_hours", "numeric_baselines", "usual_processes", "usual_destination_ips"):
            if type(getattr(self, name)) is not tuple:
                raise ValueError("Profile collections must be immutable tuples")
        if not self.login_hours or len(self.login_hours) > self.sample_count:
            raise ValueError("Successful login history is required")
        for hour in self.login_hours:
            _number(hour, 0, 24)
            if hour == 24:
                raise ValueError("Invalid login hour")
        if self.login_hours != tuple(sorted(set(self.login_hours))):
            raise ValueError("Login hours must be unique and sorted")
        if len(self.numeric_baselines) != len(NUMERIC):
            raise ValueError("Invalid numeric baselines")
        for entry in self.numeric_baselines:
            if type(entry) is not tuple or len(entry) != 2:
                raise ValueError("Expected median/MAD pair")
            for value in entry:
                _number(value)
        for values in (self.usual_processes, self.usual_destination_ips):
            for value in values:
                _text(value)
            if values != tuple(sorted(set(values))) or len(values) > self.sample_count:
                raise ValueError("Usual values must be unique and sorted")
        for value in self.usual_destination_ips:
            if str(ip_address(value)) != value:
                raise ValueError("IP literals must be canonical")

    @classmethod
    def build(cls, history, *, generated_timestamp, minimum_history=20, usual_frequency=0.05):
        """Caller supplies historical simulated normal events and an explicit cutoff."""
        history = tuple(history)
        if type(minimum_history) is not int or minimum_history < 2:
            raise ValueError("minimum history must be an integer >= 2")
        if len(history) < minimum_history:
            raise ValueError("Insufficient minimum history")
        _number(usual_frequency, 1e-9, 1)
        cutoff = _time(generated_timestamp)
        if any(not isinstance(e, EndpointEvent) for e in history):
            raise ValueError("Expected validated EndpointEvent history")
        first = history[0]
        if any((e.endpoint_id, e.user_id) != (first.endpoint_id, first.user_id) for e in history):
            raise ValueError("Mixed endpoint/user identity in history")
        if any(_time(e.timestamp) >= cutoff for e in history):
            raise ValueError("History must precede profile generation")
        baselines = []
        for name in NUMERIC:
            values = [getattr(e, name) for e in history]
            center = median(values)
            baselines.append((center, median(abs(v - center) for v in values)))

        def usual(name):
            counts = Counter(getattr(e, name) for e in history)
            return tuple(sorted(v for v, n in counts.items() if n / len(history) >= usual_frequency))

        return cls(first.endpoint_id, first.user_id, generated_timestamp,
                   max(history, key=lambda e: _time(e.timestamp)).timestamp,
                   len(history), minimum_history, usual_frequency,
                   tuple(sorted({_hour(e) for e in history if e.successful_login})),
                   tuple(baselines), usual("process_name"), usual("destination_ip"),
                   sum(e.powershell_used for e in history) / len(history))

    def score(self, event):
        if not isinstance(event, EndpointEvent):
            raise TypeError("Expected validated EndpointEvent")
        if (event.endpoint_id, event.user_id) != (self.endpoint_id, self.user_id):
            raise ValueError("Event identity does not match profile")
        if _time(event.timestamp) < _time(self.generated_timestamp):
            raise ValueError("Current event must not precede profile generation")
        signals = {name: 0.0 for name in WEIGHTS}
        if event.successful_login:
            distance = min(_distance(_hour(event), hour) for hour in self.login_hours)
            signals["login_time"] = _cap((distance - 1) / 5)
        for name, (center, mad) in zip(NUMERIC, self.numeric_baselines, strict=True):
            scale = max(1.4826 * mad, 1.0, 0.1 * center)
            signals[name] = _cap(((getattr(event, name) - center) / scale - 3) / 6)
        signals["process_name"] = float(event.process_name not in self.usual_processes)
        signals["destination_ip"] = float(event.destination_ip not in self.usual_destination_ips)
        signals["powershell_used"] = (float(event.powershell_used)
                                     * _cap(1 - self.powershell_frequency / self.usual_frequency))
        signals["encoded_command"] = float(event.encoded_command)
        signals["privilege_event"] = float(event.privilege_event)
        descriptions = {
            "login_time": "Unusual successful login time (UTC).",
            "failed_login_count": "Excessive failed logins relative to history.",
            "process_name": "Unusual process outside the frequent historical set.",
            "powershell_used": "Rare PowerShell use relative to history.",
            "encoded_command": "Encoded command flag present.",
            "file_access_count": "Abnormally high file access relative to history.",
            "outbound_bytes": "Abnormally high outbound traffic relative to history.",
            "destination_ip": "New or infrequent destination IP relative to history.",
            "privilege_event": "Privilege activity flag present.",
        }
        deviation = _cap(math.fsum(WEIGHTS[k] * v for k, v in signals.items()))
        return {"behaviour_deviation": deviation, "behaviour_risk_score": deviation * 100,
                "signal_scores": signals,
                "evidence": [descriptions[k] for k, v in signals.items() if v >= 0.2]}

    def save(self, path):
        """Write a caller-selected local JSON file; never execute serialized data."""
        Path(path).write_text(json.dumps(asdict(self), allow_nan=False, sort_keys=True,
                                        indent=2) + "\n", encoding="utf-8")

    @classmethod
    def load(cls, path):
        def reject_constant(value):
            raise ValueError(f"Nonfinite JSON constant: {value}")

        def unique_pairs(pairs):
            result = {}
            for key, value in pairs:
                if key in result:
                    raise ValueError("Duplicate JSON key")
                result[key] = value
            return result

        raw = json.loads(Path(path).read_text(encoding="utf-8"),
                         parse_constant=reject_constant, object_pairs_hook=unique_pairs)
        if not isinstance(raw, dict) or set(raw) != {f.name for f in fields(cls)}:
            raise ValueError("Malformed profile fields")
        for name in ("login_hours", "numeric_baselines", "usual_processes", "usual_destination_ips"):
            if not isinstance(raw[name], list):
                raise TypeError("Malformed profile collection")
            if name == "numeric_baselines":
                if any(not isinstance(pair, list) for pair in raw[name]):
                    raise ValueError("Malformed numeric baseline")
                raw[name] = [tuple(pair) for pair in raw[name]]
            raw[name] = tuple(raw[name])
        return cls(**raw)
