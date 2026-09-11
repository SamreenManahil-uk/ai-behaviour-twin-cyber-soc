# Simulated SOAR response boundary

This portfolio component demonstrates an auditable SOC response workflow. It
does not perform real endpoint or network enforcement.

Supported simulations:

- Isolate endpoint
- Block IP address
- Terminate process
- Disable account
- Collect forensics

Every request is associated with an existing alert, its endpoint and the
authenticated persisted user. The action, validated target, justification,
timestamps and explicit simulation result are stored in
`simulated_response_actions`.

## Safety boundary

`SimulatedSoarExecutor` only creates deterministic explanatory text. It has no
shell execution, operating-system process control, firewall integration,
directory-service integration, remote management, endpoint agent or telemetry
collection capability.

The database includes a check constraint requiring `is_simulation = TRUE`.
There are no update or delete API routes, making records append-only through
the HTTP boundary.

Reading history requires the `SocOperations` policy. Creating a simulation
requires `AdminOnly`. This means an authenticated SOC analyst receives HTTP 403
for action creation rather than HTTP 401.

This is a workflow demonstration, not evidence that endpoint containment or
SOAR automation has been validated in a real environment.

## Frontend behavior

The alert details drawer presents all five allow-listed response simulations
with a mandatory confirmation step and analyst justification.

Demo accounts never send a response-action request to the backend. Demo Admin
creates a browser-memory preview clearly labelled `Browser-only demo`; it is
not presented as PostgreSQL persistence. Demo SOC Analyst sees disabled action
controls because creation is an AdminOnly operation.

For a real authenticated Admin and a real UUID-backed alert, the frontend uses:

- `GET /api/alerts/{alertId}/response-actions`
- `POST /api/alerts/{alertId}/response-actions`

The UI displays loading, validation, API-error and audit-history states. It
never claims that a simulation changed a real machine.
