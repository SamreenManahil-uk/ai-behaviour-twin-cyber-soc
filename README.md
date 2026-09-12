# AI Behaviour-Twin Cyber SOC

A full-stack cyber security portfolio platform demonstrating network threat
detection, endpoint behaviour profiling, SOC analyst workflows, real-time
alerts and simulated response orchestration.

This project combines machine learning, ASP.NET Core, PostgreSQL, React,
FastAPI, SignalR and Docker in one security-focused platform.

> This is a development portfolio prototype. It is not a production SIEM,
> EDR, endpoint protection product or validated threat-detection system.

## Project purpose

Security Operations Centre analysts need to review large numbers of events,
identify unusual behaviour, prioritise alerts and maintain an auditable
incident-response workflow.

This project demonstrates that process through:

- supervised network threat classification;
- benign-only anomaly detection;
- simulated endpoint behaviour baselines;
- explainable hybrid risk scoring;
- deterministic security rules;
- alert and incident management;
- role-based access control;
- real-time SignalR notifications;
- simulated SOAR actions;
- a professional analyst dashboard.

## Main capabilities

### Machine learning

- Leakage-safe UNSW-NB15 preprocessing.
- Dataset inspection and reproducible EDA.
- XGBoost supervised network threat classification.
- Isolation Forest trained only on benign training rows.
- Empirical anomaly scoring based on the benign reference distribution.
- Simulated Behaviour Twin profiles using historical normal events.
- Explainable hybrid risk scoring.
- Strict JSON reports and versioned local model bundles.
- FastAPI inference endpoints.

### Secure backend

- ASP.NET Core Web API.
- PostgreSQL persistence through Entity Framework Core.
- Versioned EF Core migrations.
- JWT authentication.
- Admin and SOC Analyst role-based authorization.
- Endpoints, events, alerts, incidents and threat-intelligence APIs.
- Input validation and safe ProblemDetails responses.
- Internal FastAPI inference client.
- Deterministic security-rule detection.
- MITRE ATT&CK technique references.
- Secured SignalR alert hub.
- Simulated SOAR audit workflows.

### Professional frontend

- React and TypeScript.
- Responsive analyst dashboard.
- Dark and light themes.
- Reusable buttons, badges, modals, drawers, forms and pagination.
- Security metrics and charts.
- Events, alerts, incidents, endpoints and threat-intelligence views.
- MITRE ATT&CK and analytics pages.
- System-health monitoring.
- Loading, empty and error states.
- Search, filters and interactive tables.
- Demo Analyst and Demo Admin modes.
- SignalR client integration.
- Simulated SOAR confirmation and audit interface.
- Accessible navigation and protected routes.

### DevSecOps

- Multi-stage Docker builds.
- Non-root application containers.
- Localhost-only development port bindings.
- Docker Compose orchestration.
- Read-only model artifact mounting.
- One-shot EF Core migration container.
- GitHub Actions validation for backend, ML and frontend.
- Automated tests, linting, formatting and production builds.
- Local secret and configuration checks.
- Repeatable start, check and stop scripts.

## Technology stack

### Backend

- C# and .NET 10
- ASP.NET Core
- Entity Framework Core
- Npgsql
- PostgreSQL
- JWT Bearer authentication
- SignalR
- xUnit

### Machine learning

- Python 3.12
- FastAPI
- XGBoost
- scikit-learn
- pandas
- NumPy
- joblib
- pytest
- Ruff

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- Axios
- Microsoft SignalR client
- Vitest
- React Testing Library

### Infrastructure

- Docker
- Docker Compose
- Nginx
- GitHub Actions

## Detection approaches

### XGBoost classifier

The XGBoost model uses labelled network-flow data to produce a supervised
threat score.

Official test-split results:

- Accuracy: 0.8753461594519749
- Precision: 0.8234729831940524
- Recall: 0.9846907261978294
- F1: 0.8968946844955243
- ROC-AUC: 0.9840503006646459
- Average precision: 0.9883405461285941

These are benchmark results on the selected historical dataset. They do not
establish production detection performance.

### Isolation Forest

Isolation Forest is fitted only on benign rows from the official training
split. Its threshold is selected using only benign training scores.

Official test-split results:

- Accuracy: 0.5780862847981344
- Precision: 0.845812389842679
- Recall: 0.2858245830759728
- F1: 0.4272641836078548
- ROC-AUC: 0.7700440310048864
- Average precision: 0.8031739458582527

The anomaly score represents unusualness relative to the benign training
reference. It is not a calibrated attack probability.

### Behaviour Twin

The Behaviour Twin component learns a baseline from deterministic simulated
normal endpoint events.

It models:

- circular login-hour behaviour;
- failed-login activity;
- file-access activity;
- outbound network traffic;
- usual processes;
- usual destination IP addresses;
- PowerShell and encoded-command behaviour;
- privilege activity.

It does not inspect the host computer or collect real endpoint telemetry.

### Hybrid risk

The hybrid risk engine combines explicitly weighted model and behaviour
signals while preserving their separate explanations.

The resulting risk score is a prioritisation aid for this portfolio prototype,
not a calibrated probability of attack.

## Deterministic rules

The backend demonstrates transparent security rules including:

- encoded PowerShell activity;
- repeated failed logins;
- suspicious Windows utilities;
- privilege activity;
- unusually high outbound traffic.

Rules may reference relevant MITRE ATT&CK techniques, but the project does not
claim complete ATT&CK coverage.

## Simulated SOAR

Supported demonstrations include:

- isolate endpoint;
- block IP address;
- terminate process;
- disable account;
- collect forensics.

Every action is simulation-only and audit-oriented. The application cannot
perform any of these operations against a real computer, account, process or
network.

## Local Docker demonstration

### Requirements

- Docker Desktop
- Git

Create the ignored local configuration file from:

```bash
cp infrastructure/docker/.env.example infrastructure/docker/.env
chmod 600 infrastructure/docker/.env