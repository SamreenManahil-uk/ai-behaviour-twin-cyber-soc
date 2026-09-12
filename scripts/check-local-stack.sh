#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

COMPOSE=(
  docker compose
  --env-file "$ROOT/infrastructure/docker/.env"
  --file "$ROOT/infrastructure/docker/compose.yml"
)

echo "===== SERVICE STATUS ====="
"${COMPOSE[@]}" ps

echo "===== HEALTH ENDPOINTS ====="
curl --fail --silent --show-error \
  http://127.0.0.1:8001/health \
  > "$TEMP_DIR/ml.json"

curl --fail --silent --show-error \
  http://127.0.0.1:5080/api/health \
  > "$TEMP_DIR/backend.json"

curl --fail --silent --show-error \
  http://127.0.0.1:5173/api/health \
  > "$TEMP_DIR/proxy.json"

curl --fail --silent --show-error \
  --dump-header "$TEMP_DIR/frontend-headers.txt" \
  http://127.0.0.1:5173/ \
  > "$TEMP_DIR/frontend.html"

python3 -c '
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
assert data.get("status") == "healthy"
assert data["models"]["xgboost"]["ready"] is True
assert data["models"]["isolationForest"]["ready"] is True
' "$TEMP_DIR/ml.json"

python3 -c '
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
assert data.get("status") == "healthy"
' "$TEMP_DIR/backend.json"

python3 -c '
import json
import sys

data = json.load(open(sys.argv[1], encoding="utf-8"))
assert data.get("status") == "healthy"
' "$TEMP_DIR/proxy.json"

grep -qi '<div id="root">' "$TEMP_DIR/frontend.html"
grep -qi '^x-content-type-options: nosniff' \
  "$TEMP_DIR/frontend-headers.txt"

echo "PASS: ML API healthy"
echo "PASS: XGBoost ready"
echo "PASS: Isolation Forest ready"
echo "PASS: ASP.NET API healthy"
echo "PASS: Nginx proxy reaches ASP.NET"
echo "PASS: React application served"
echo "PASS: Nginx security header present"

echo "===== AUTHENTICATION BOUNDARY ====="
HTTP_STATUS="$(
  curl --silent \
    --output /dev/null \
    --write-out '%{http_code}' \
    http://127.0.0.1:5080/api/endpoints
)"

test "$HTTP_STATUS" = "401" || {
  echo "Expected HTTP 401, received $HTTP_STATUS"
  exit 1
}

echo "PASS: Protected API rejects anonymous request with HTTP 401"

echo "===== MIGRATION CONTAINER ====="
MIGRATION_EXIT="$(
  docker inspect cyber-soc-migrations \
    --format '{{.State.ExitCode}}'
)"

test "$MIGRATION_EXIT" = "0" || {
  echo "Migration exit code is $MIGRATION_EXIT"
  exit 1
}

echo "PASS: EF migration container exited successfully"

echo "===== LOCALHOST-ONLY PORTS ====="
for container in \
  cyber-soc-postgres \
  cyber-soc-ml \
  cyber-soc-backend \
  cyber-soc-frontend
do
  BINDINGS="$(docker port "$container")"

  echo "$BINDINGS" | grep -q '127.0.0.1:'

  if echo "$BINDINGS" |
    grep -Eq '(^|[[:space:]])0\.0\.0\.0:|\[::\]:'
  then
    echo "STOP: $container has a non-localhost binding"
    exit 1
  fi

  echo "PASS: $container is localhost-only"
done

echo "LOCAL STACK CHECK PASSED"
