# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/CyberSoc.Api/CyberSoc.Api.csproj src/CyberSoc.Api/
RUN dotnet restore src/CyberSoc.Api/CyberSoc.Api.csproj

COPY src/CyberSoc.Api/ src/CyberSoc.Api/
RUN dotnet publish src/CyberSoc.Api/CyberSoc.Api.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore \
    /p:UseAppHost=false \
    /p:TreatWarningsAsErrors=true

FROM build AS migrations

ENV PATH="/root/.dotnet/tools:${PATH}"

RUN dotnet tool install \
    --global dotnet-ef \
    --version 10.0.12

ENTRYPOINT ["dotnet-ef", "database", "update", "--project", "src/CyberSoc.Api/CyberSoc.Api.csproj", "--startup-project", "src/CyberSoc.Api/CyberSoc.Api.csproj", "--configuration", "Release", "--no-build"]

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://0.0.0.0:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_EnableDiagnostics=0 \
    DOTNET_CLI_TELEMETRY_OPTOUT=1

RUN apt-get update \
    && apt-get install --yes --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
    CMD ["curl", "--fail", "--silent", "--show-error", "http://127.0.0.1:8080/api/health"]

USER $APP_UID

ENTRYPOINT ["dotnet", "CyberSoc.Api.dll"]
