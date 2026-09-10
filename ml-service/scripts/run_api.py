"""Run the internal Cyber SOC ML API on localhost."""

import sys
from pathlib import Path

import uvicorn

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))


def main():
    uvicorn.run(
        "cyber_soc_ml.api.app:app",
        host="127.0.0.1",
        port=8001,
        reload=False,
        log_level="info",
    )


if __name__ == "__main__":
    main()
