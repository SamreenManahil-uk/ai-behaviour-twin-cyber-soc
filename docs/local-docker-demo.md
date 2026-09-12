# Local Docker Demonstration

This guide explains how to run the AI Behaviour-Twin Cyber SOC locally.

## Services

The Docker Compose stack runs PostgreSQL, FastAPI, ASP.NET Core, React with Nginx, and a one-shot EF Core migration container.

PostgreSQL stores SOC records. FastAPI loads the frozen XGBoost and Isolation Forest artifacts. ASP.NET Core provides authentication, SOC APIs, rule detection, SignalR and simulated SOAR. Nginx serves the React frontend and proxies API requests.

## Start

From the repository root run:

    ./scripts/start-local-stack.sh --open

The frontend opens at http://127.0.0.1:5173.

## Validate

Run:

    ./scripts/check-local-stack.sh

This checks service health, model readiness, migration completion, authentication protection and localhost-only bindings. It does not insert data or train models.

## Stop

Run:

    ./scripts/stop-local-stack.sh

This stops only Cyber SOC containers and preserves the PostgreSQL named volume.

## Safety boundary

The interface uses fictional demonstration data and does not collect live endpoint telemetry.

SOAR actions are simulations only. They cannot isolate a real endpoint, terminate a real process, disable an account, block network traffic or collect forensic evidence.

Model scores are portfolio detection signals, not calibrated attack probabilities. No production credentials are stored in the repository.
