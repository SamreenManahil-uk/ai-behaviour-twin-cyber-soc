# AI Behaviour-Twin Cyber SOC & Endpoint Security Platform

A five-day portfolio prototype exploring behaviour-based anomaly detection,
security alert triage, and analyst workflows. This is a development prototype;
it is not a production SOC, endpoint protection product, or validated threat
detection system.

Endpoint telemetry and SOAR (security orchestration, automation, and response)
actions will be simulated safely. No live endpoint isolation, process termination,
or other host enforcement is planned. ML models will use real dataset-based
training and evaluation, with documented splits, metrics, and limitations.
No dataset has been selected or downloaded, and no model has been trained yet.

## Planned architecture and stack

- **Frontend:** React and TypeScript analyst dashboard calling the backend API.
- **Backend:** C# / ASP.NET Core API for simulated telemetry, alerts, and response
  workflows; a separate test project is planned.
- **ML service:** Python 3.12, with FastAPI and scikit-learn planned for inference,
  dataset preparation, training, and evaluation. The backend will request scores
  from this service.
- **Infrastructure:** Docker-based local orchestration and GitHub Actions checks
  are planned. Framework versions and dependency pins will be chosen at setup.

Planned flow: simulated endpoint events → backend → ML scoring → alerts →
analyst dashboard → simulated response actions. Dataset-based evaluation will
be reported separately from the simulated workflow demonstration.

## Repository layout

| Folder | Purpose |
| --- | --- |
| `backend/` | Future ASP.NET Core API source and tests. |
| `ml-service/` | Python source, tests, local datasets, model artifacts, and evaluation reports. |
| `frontend/` | Future React analyst interface. |
| `infrastructure/` | Future local infrastructure and Docker configuration. |
| `docs/` | Architecture decisions and interview preparation notes. |
| `scripts/` | Future repository development and validation scripts. |
| `.github/` | Future CI workflows. |

## Five-day development status

| Day | Planned milestone | Status |
| --- | --- | --- |
| 1 | Repository foundation and application setup | Repository scaffold only; application setup pending. |
| 2 | Dataset preparation, baseline training, and evaluation | Planned. |
| 3 | API integration and simulated telemetry/alert workflows | Planned. |
| 4 | Analyst dashboard and simulated SOAR actions | Planned. |
| 5 | Integration validation, documentation, and demo preparation | Planned. |

Only folders and repository-level configuration exist. Applications, virtual
environments, packages, Docker configuration, and CI workflows have not been
created. No build or test has been run because application code does not exist yet.

`.env.example` contains empty placeholders for future local configuration;
it supplies no credentials or runnable configuration. Local environment files,
datasets, model binaries, and generated outputs are excluded from Git.
