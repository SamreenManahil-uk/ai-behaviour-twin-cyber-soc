#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

docker compose \
  --env-file "$ROOT/infrastructure/docker/.env" \
  --file "$ROOT/infrastructure/docker/compose.yml" \
  stop

echo "Cyber SOC containers stopped."
echo "PostgreSQL named volume preserved."
echo "No unrelated container was changed."
