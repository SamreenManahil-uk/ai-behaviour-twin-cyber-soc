# Cyber SOC API

Controller-based ASP.NET Core foundation targeting .NET 10 with a separate xUnit
integration test project. Requires .NET SDK 10.0.401 or a compatible .NET 10 SDK.

From the repository root, keep CLI state and package caches inside the backend:

```sh
export DOTNET_CLI_HOME="$PWD/backend/.cache/dotnet"
export NUGET_PACKAGES="$PWD/backend/.cache/nuget"
export DOTNET_CLI_TELEMETRY_OPTOUT=1
export DOTNET_GENERATE_ASPNET_CERTIFICATE=false

dotnet restore backend/CyberSoc.sln
dotnet build backend/CyberSoc.sln --no-restore --warnaserror
dotnet test backend/CyberSoc.sln --no-build --no-restore
dotnet format backend/CyberSoc.sln --verify-no-changes --no-restore
# Supply external Jwt__Issuer, Jwt__Audience, and Jwt__SigningKey first (see authentication below).
dotnet run --project backend/src/CyberSoc.Api --no-build --launch-profile http
```

The HTTP launch profile uses Development and `http://localhost:5080`.
Stop the API with Ctrl+C.

- Health: `GET http://localhost:5080/api/health`
- Swagger UI: `http://localhost:5080/swagger/index.html`
- OpenAPI document: `http://localhost:5080/openapi/v1.json`

Swagger UI and OpenAPI are exposed only in Development. HTTPS redirection is
omitted because this foundation configures an HTTP listener for local testing.
Deployment transport configuration is deferred.

The health DTO contains `status`, `service`, `version`, and `timestamp` (UTC).
Version comes from the project version, without a Git revision suffix. Health is
an API liveness check; it does not report readiness of any external dependencies.
JSON uses camelCase names, strict numbers, and camelCase string enums.

Integration tests host the real application through WebApplicationFactory and
verify the health JSON contract, UTC timestamp, unknown route handling, and
Development-only documentation. No external services are required.

## PostgreSQL persistence foundation

EF Core, Relational, Design, and the local `dotnet-ef` tool use 10.0.12;
Npgsql.EntityFrameworkCore.PostgreSQL uses 10.0.3. The explicit Relational reference
aligns transitive versions in the API and tests. Design is a private development
dependency. The local tool manifest is `backend/dotnet-tools.json`.

`CyberSocDbContext` is scoped. Set `ConnectionStrings__PostgreSql` in the environment
to override `ConnectionStrings:PostgreSql`; the checked-in value is empty. Missing
configuration fails clearly when the context is resolved. Health and Swagger do
not resolve it. No connection is opened and no migration is applied at startup.

The design-time factory configures Npgsql offline when
`ConnectionStrings__PostgreSql` is absent, and uses that explicit environment
connection when supplied for migration application. After setting the cache variables above from
the repository root, run these offline commands from `backend/`:

```sh
dotnet tool restore
dotnet ef dbcontext list --project src/CyberSoc.Api
dotnet ef migrations list --project src/CyberSoc.Api --no-connect
dotnet ef migrations has-pending-model-changes --project src/CyberSoc.Api
```

`InitialSocSchema` was generated with `dotnet ef migrations add InitialSocSchema
--project src/CyberSoc.Api --output-dir Migrations`. It was applied once to the local SOC database during Step 3.
Migration application requires an explicit environment connection; no credentials
are accepted from tracked configuration files by the design-time factory.

### Schema conventions

- Six tables: `users`, `endpoints`, `security_events`, `alerts`, `incidents`, `threats`.
  Tables, columns, keys, foreign keys, and indexes use snake_case names.
- Endpoint has many events and alerts. An event has zero or one alert. Each alert
  requires an event and endpoint; a composite foreign key ensures they refer to
  the same endpoint. An incident has many alerts and an optional assigned user.
- All five foreign keys use `RESTRICT`. Removing referenced records requires
  explicitly resolving relationships first; no implicit history deletion occurs.
- Email assignments trim and uppercase invariantly. Email has a unique index and
  a database check for trimmed uppercase nonempty text. This is a case-insensitive
  account identity policy, not email syntax validation. PostgreSQL Unicode casing
  depends on collation and must be checked during provisioning. Hostname uniqueness
  uses exact stored text; canonical hostname validation belongs in future ingestion.
- Timestamps use `DateTimeOffset` and `timestamp with time zone` (`timestamptz`).
  Callers must supply zero-offset UTC values. Sync and async saves reject nonzero
  offsets before database access. PostgreSQL stores instants, not timezone labels.
  No clock-driven entity defaults or automatic timestamp updates are configured;
  future write services must set creation, update, and observation times explicitly.
- Enums persist as readable member names in bounded strings. Renaming a member
  requires a data migration. Score setters enforce inclusive 0–100 bounds, repeated
  by database checks on `numeric(5,2)` columns. PostgreSQL rounds to two decimals.
- `RawPayload` is required JSON text mapped to `jsonb`; PostgreSQL validates JSON
  on write. Other strings have length limits. Indexes cover endpoint timelines,
  triage status/severity, assignment, and threat indicators. IPs use bounded text.
- Only `PasswordHash` exists: no plaintext password field, account seeding, password
  processing in persistence entities, or CRUD endpoints. Future account creation must use
  a vetted password hasher and supply only its encoded output. Required database
  fields enforce non-null values; full input validation belongs at write boundaries.

Tests inspect real Npgsql metadata without opening a connection and cover scores,
UTC enforcement, email normalization, missing configuration, and existing HTTP
behavior. Step 3 verified the live schema and an endpoint/event SQL transaction with rollback.
Other entity round trips and negative database constraint tests remain future work.


## Local PostgreSQL with Docker Compose

The service definition is `infrastructure/docker/compose.yml`, using the official
`postgres:18.6-trixie` image. It binds only `127.0.0.1:5433`, uses a pg_isready
healthcheck, and preserves data in `cyber-soc-postgres-data`. The application role
is a non-superuser database owner with no role/database creation or replication
privileges. The separate initialization administrator is never used by the API.
Initialization runs only against a new volume; editing environment credentials
after initialization does not change database passwords.

Copy the adjacent `.env.example` to `.env` for a fresh setup, replace both fake
passwords with independently generated values, and restrict the file to mode 600.
A generated local `.env` already exists for this workspace and is Git-ignored.
Do not overwrite it or print its contents. Do not print expanded Compose config
or full container inspection output because environment values contain secrets.

From the repository root, after ensuring port 5433 is available:

```sh
docker compose -f infrastructure/docker/compose.yml up -d --wait postgres
docker compose -f infrastructure/docker/compose.yml stop postgres
```

Use `ConnectionStrings__PostgreSql` with host `127.0.0.1`, port `${POSTGRES_HOST_PORT}` (5433 locally), database
`cyber_soc`, and the application credentials from the ignored `.env`. Construct
connection-string values with proper quoting (double embedded double quotes in
quoted values), and pass the result in the child process environment rather than
an EF `--connection` command-line argument. Do not use the administrator account.
The same environment variable configures both the API and EF design-time factory.

The host port is configurable through `POSTGRES_HOST_PORT`, defaulting to 5433.
The container continues to listen on port 5432. The other project's PostgreSQL
service on host port 5432 is independent and must not be altered.


Step 3 live validation passed on PostgreSQL 18.6: the migration history contains
exactly `20260910104045_InitialSocSchema` (EF 10.0.12). All six SOC tables and
`__EFMigrationsHistory` exist. Five restrictive foreign keys, the key unique
indexes, JSONB payload, 14 timestamptz columns, and both numeric score constraints
were verified against PostgreSQL catalogs using the non-superuser application
role. A fictional endpoint and event were inserted and read inside a transaction;
rollback completed and neither row remained. No users or credentials were inserted
into application tables. All 29 .NET tests passed while PostgreSQL was healthy.
The API returned HTTP 200 with its configured database environment. The API and
SOC container were then stopped, preserving the named volume. This liveness
endpoint does not itself check database connectivity.


## JWT authentication and roles

`POST /api/auth/login` accepts email and password, returning `accessToken`,
`tokenType` (`Bearer`), `expiresAtUtc`, and a public user identity (`id`, `email`,
`displayName`, `role`). Unknown email, wrong password, and inactive accounts all
return the same HTTP 401 ProblemDetails. Malformed input returns HTTP 400.
`GET /api/auth/me` requires the `SocOperations` policy and returns identity from
validated claims without a database query. Auth responses use `Cache-Control:
no-store`. No registration endpoint or account seed is provided.

Configure `Jwt:Issuer`, `Jwt:Audience`, `Jwt:SigningKey`, and
`Jwt:AccessTokenMinutes` through external configuration. Environment overrides are
`Jwt__Issuer`, `Jwt__Audience`, `Jwt__SigningKey`, and `Jwt__AccessTokenMinutes`.
Tracked issuer, audience, and key values are empty. Startup rejects missing
issuer/audience, keys shorter than 32 UTF-8 bytes, and lifetimes outside 1–60
minutes. The default lifetime is 15 minutes. Supply strong randomly generated
signing material through your deployment's secret facility; never put it in
source control, CLI arguments, request logs, Swagger, or this README. No real
signing material was generated for this step. Local verification uses only the
obvious test-only value from the test project, injected into the API environment;
that value must never be used for a real account or deployment.

JwtBearer 10.0.12 validates issuer, audience, signature, required expiration, and
lifetime with zero clock skew. Only HS256 is accepted. Claim mapping is disabled;
`sub`, `email`, `name`, `role`, and `jti` carry minimal identity alongside standard
issuer/audience/time claims. Expiration is UTC. Role strings match `UserRole`
member names exactly: `Admin` and `SocAnalyst`. `AdminOnly` permits Admin;
`SocOperations` permits both roles. No test-only production endpoint exists.
OpenAPI describes HTTP Bearer authentication and marks protected operations using
authorization metadata, enabling Swagger UI's Authorize button in Development.

Controllers delegate login to `LoginService`. `IAuthUserStore` is a narrow login
boundary; its EF implementation queries only active users asynchronously with
`AsNoTracking` and cancellation. Email normalization matches `User.Email`.
`IPasswordService` wraps Identity's salted PBKDF2 `PasswordHasher<User>` and
preserves `SuccessRehashNeeded`. Successful legacy-hash verification upgrades the
hash with an atomic comparison against the original hash and active flag; a
concurrent account change makes login fail. Unknown/inactive accounts perform
an in-memory dummy hash verification to reduce timing differences. This dummy
object is never persisted and is not a usable account. No custom cryptography,
plaintext comparison, token storage, or credential seeding is implemented.

Unexpected request exceptions return generic ProblemDetails; server diagnostics
record only a trace identifier, not exception text, request bodies, keys, or tokens.
Authentication failures do not include token-validation details. Tests replace
only the user store and supply clearly non-production JWT configuration. Existing
HTTP tests use that configured factory; their original assertions remain intact.
The complete test suite requires no PostgreSQL server or Docker container.

Limitations: issued tokens remain valid until expiration after role/account changes;
there is no revocation store, refresh flow, lockout, MFA, or rate limiting in this
step. Health remains liveness-only. Real deployments must use HTTPS and external
key management; the existing HTTP profile is for local development. EF login and
rehash operations are covered through the abstraction and code review, not a live
database authentication test. No real users or signing keys were created.


## SOC REST resources

Authorized controllers expose explicit DTOs under `/api/endpoints`, `/api/events`,
`/api/alerts`, `/api/incidents`, and `/api/threats`. Every route requires a bearer
JWT. Reads and event ingestion use `SocOperations`; endpoint and threat writes
use `AdminOnly`. Controllers delegate to focused services with asynchronous EF
queries, cancellation, no-tracking reads, stable ordering, bounded one-based
pagination, and RFC ProblemDetails failures. Responses never serialize EF entities,
users, password hashes, or alert raw payloads in list/detail summaries.

Endpoint writes normalize hostnames and validate IPs. Event ingestion generates its
own UUID and ingestion timestamp, validates endpoint existence and bounded JSON,
and never creates an alert or calls ML. Alert updates change status only. Incident
creation validates active assignees and all alert ids, rejects already-attached
alerts, and attaches them in a serializable transaction. Incident lifecycle edits
maintain `ResolvedAtUtc` when resolved/closed and clear it when reopened. Threat
writes validate IP, DNS domain, SHA-256 hash, HTTP(S) URL, or bounded process values,
normalize indicator identity, reject reversed observation times, and prevent active
duplicates under a serializable transaction. No real endpoint collection, response
action, detection, MITRE mapping, or SOAR operation exists yet.

The normal test suite uses pure request validation and WebApplicationFactory boundary
checks. It does not use an in-memory EF provider to claim PostgreSQL correctness;
PostgreSQL-specific schema and query behavior remain covered by Step 3 live checks
and should be exercised again for future persistence changes.

## Internal ML service integration

The authorized `POST /api/predict` endpoint forwards one validated network-flow
feature object to the private FastAPI service. Configure the internal URL with
`MlService__BaseUrl`; local development uses `http://127.0.0.1:8001`.
The client enforces a bounded timeout and translates upstream failures into safe
ProblemDetails responses. It never logs raw security-event features or claims
that the returned model scores are calibrated attack probabilities.

## Real-time alert updates

Authorized Admin and SOC Analyst clients can connect to `/hubs/alerts` using
SignalR. Alert status changes are persisted and committed before a safe summary
is broadcast through the `AlertUpdated` client method.

Raw security-event payloads and alert descriptions are not broadcast. Real-time
delivery is best effort; PostgreSQL remains the source of truth. A production
deployment should use an outbox/message-broker design when guaranteed delivery
is required. Browser WebSocket authentication requires HTTPS/WSS in production.
