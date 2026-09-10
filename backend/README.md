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
