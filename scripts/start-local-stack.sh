#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

COMPOSE=(
  docker compose
  --env-file "$ROOT/infrastructure/docker/.env"
  --file "$ROOT/infrastructure/docker/compose.yml"
)

test -f "$ROOT/infrastructure/docker/.env" || {
  echo "Missing infrastructure/docker/.env"
  exit 1
}

"${COMPOSE[@]}" config --quiet
"${COMPOSE[@]}" up --detach --build --wait --wait-timeout 240

echo "Cyber SOC local stack is ready."
echo "Frontend: http://127.0.0.1:5173"
echo "Backend: http://127.0.0.1:5080/api/health"
echo "ML API: http://127.0.0.1:8001/health"

if [ "${1:-}" = "--open" ]; then
  if command -v open >/dev/null 2>&1; then
    open http://127.0.0.1:5173
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open http://127.0.0.1:5173
  fi
fi
