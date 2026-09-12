# Continuous integration

The repository uses GitHub Actions to validate every push and pull request
targeting `main`.

## ASP.NET Core job

The backend job:

1. Installs .NET 10.
2. Restores the solution.
3. Builds Release configuration with warnings treated as errors.
4. Runs the complete database-independent .NET test suite.
5. Verifies `dotnet format`.

It does not start PostgreSQL. PostgreSQL-specific behavior was validated
separately against the local container, while normal CI remains fast and does
not require credentials.

## Python ML service job

The Python job:

1. Installs Python 3.12.
2. Installs the Linux OpenMP runtime required by XGBoost.
3. Installs the pinned runtime and development requirements.
4. Runs `pip check`.
5. Runs Ruff.
6. Runs the complete synthetic Python test suite.

The CI job does not download UNSW-NB15, access raw telemetry, retrain either
model or create model artifacts. Raw datasets and joblib bundles remain
Git-ignored.

Tests use small synthetic inputs and mocked or temporary bundles where
appropriate.

## React frontend job

The frontend job:

1. Installs Node.js.
2. Uses `npm ci` and the tracked lockfile.
3. Audits production dependencies at high severity.
4. Runs Vitest.
5. Runs Oxlint.
6. Creates the TypeScript/Vite production build.

No API credentials or browser tokens are used.

## Security and operational boundary

The workflow has read-only repository permissions. It contains no database
password, JWT signing key, API token or production credential.

CI does not:

- start Docker
- apply database migrations
- seed users
- access real endpoint telemetry
- perform real SOAR actions
- retrain ML models
- publish or deploy the application

Deployment remains a separate future concern.
