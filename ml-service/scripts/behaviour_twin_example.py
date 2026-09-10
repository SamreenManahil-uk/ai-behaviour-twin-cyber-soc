"""Small deterministic fictional Windows example; no real telemetry or actions."""

import json
import sys
from dataclasses import replace
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from cyber_soc_ml.behaviour_twin import BehaviourTwin, EndpointEvent


def example():
    normal = EndpointEvent("fictional-win-01", "fictional-alex", "2026-01-25T10:00:00Z",
                           True, 0, "explorer.exe", False, False, 100, 10000,
                           "192.0.2.10", False)
    history = [replace(normal, timestamp=f"2026-01-{day:02d}T{9 + day % 3:02d}:00:00Z",
                       file_access_count=100 + day % 5, outbound_bytes=10000 + day % 5 * 100)
               for day in range(1, 25)]
    twin = BehaviourTwin.build(history, generated_timestamp="2026-01-25T00:00:00Z")
    suspicious = replace(normal, timestamp="2026-01-26T02:00:00Z", failed_login_count=30,
                         process_name="powershell.exe", powershell_used=True,
                         encoded_command=True, file_access_count=50000,
                         outbound_bytes=10000000, destination_ip="203.0.113.77",
                         privilege_event=True)
    return {"normal": twin.score(normal), "suspicious": twin.score(suspicious)}


if __name__ == "__main__":
    print(json.dumps(example(), indent=2, allow_nan=False))
