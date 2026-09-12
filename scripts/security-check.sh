#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COMPOSE=(
  docker compose
  --env-file infrastructure/docker/.env
  --file infrastructure/docker/compose.yml
)

echo "===== LOCAL ENV SAFETY ====="
git check-ignore -q infrastructure/docker/.env

if git ls-files --error-unmatch \
  infrastructure/docker/.env >/dev/null 2>&1
then
  echo "STOP: Local .env is tracked by Git"
  exit 1
fi

MODE="$(
  stat -f '%Lp' infrastructure/docker/.env 2>/dev/null ||
  stat -c '%a' infrastructure/docker/.env
)"

test "$MODE" = "600" || {
  echo "STOP: Local .env mode is $MODE instead of 600"
  exit 1
}

echo "PASS: Local .env is ignored, untracked and mode 600"

echo "===== COMPOSE VALIDATION ====="
"${COMPOSE[@]}" config --quiet
echo "PASS: Compose configuration is valid"

echo "===== LOCALHOST PORT BINDINGS ====="
BINDING_COUNT="$(
  grep -c '127.0.0.1:${.*HOST_PORT' \
    infrastructure/docker/compose.yml
)"

test "$BINDING_COUNT" = "4" || {
  echo "STOP: Expected 4 localhost host-port bindings"
  exit 1
}

if grep -nE \
  '^[[:space:]]*-[[:space:]]*["'\'']?(0\.0\.0\.0|\[::\]):' \
  infrastructure/docker/compose.yml
then
  echo "STOP: Public Docker host binding detected"
  exit 1
fi

echo "PASS: PostgreSQL, ML, backend and frontend are localhost-only"

echo "===== CONTAINER USERS ====="
grep -q '^USER \$APP_UID' backend/Dockerfile
grep -q '^USER appuser' ml-service/Dockerfile
grep -q '^USER 101' frontend/Dockerfile

echo "PASS: Application runtime images use non-root users"

echo "===== BUILD CONTEXT EXCLUSIONS ====="
grep -qx 'models' ml-service/.dockerignore
grep -qx 'data' ml-service/.dockerignore
grep -qx '.env' ml-service/.dockerignore
grep -qx '.env' backend/.dockerignore
grep -qx '.env' frontend/.dockerignore
git check-ignore -q ml-service/models/xgboost-network-v1.joblib
git check-ignore -q \
  ml-service/models/isolation-forest-network-v1.joblib

echo "PASS: Models, raw data and local environment files are excluded"

echo "===== IMAGE ENVIRONMENT SAFETY ====="
for image in \
  cyber-soc-backend:day5-local \
  cyber-soc-ml:day5-local \
  cyber-soc-frontend:day5-local
do
  if docker image inspect "$image" \
    --format '{{range .Config.Env}}{{println .}}{{end}}' |
    grep -Eiq \
      '(password|signing[_]?key|api[_]?key|secret|token)=.+'
  then
    echo "STOP: Embedded secret-like image environment in $image"
    exit 1
  fi

  echo "PASS: No embedded runtime credential in $image"
done

echo "===== REPOSITORY SECRET SCAN ====="
FILE_LIST="$(mktemp)"
trap 'rm -f "$FILE_LIST"' EXIT

{
  git ls-files
  git ls-files --others --exclude-standard
} | sort -u > "$FILE_LIST"

MATCHES="$(
  xargs grep -IlE \
    '-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}' \
    < "$FILE_LIST" 2>/dev/null || true
)"

if [ -n "$MATCHES" ]; then
  echo "STOP: Possible secret material found in:"
  echo "$MATCHES"
  exit 1
fi

echo "PASS: No private key, JWT, API key, GitHub token or AWS key detected"

echo "===== PROTECTED FILE HASHES ====="
check_hash() {
  local path="$1"
  local expected="$2"
  local actual

  actual="$(shasum -a 256 "$path" | awk '{print $1}')"

  test "$actual" = "$expected" || {
    echo "STOP: Protected hash changed for $path"
    exit 1
  }

  echo "PASS: $path"
}

check_hash \
  ml-service/models/xgboost-network-v1.joblib \
  31e51ecc2f7736d1e913aff2c90a044cdb194cdd7e0a03498eba86efb217d326

check_hash \
  ml-service/models/isolation-forest-network-v1.joblib \
  861079c37651627e314403083397d84e7c1be9a2bca9da4ebfa160fc8ae52077

check_hash \
  ml-service/data/raw/UNSW_NB15_training-set.csv \
  bec7dd5ec88dc2a0ccc7a07879d338395ed7421750f675fd0339e07dfe0648fa

check_hash \
  ml-service/data/raw/UNSW_NB15_testing-set.csv \
  734fe6642edf758f7c94d7d9149426b49d202fe8e7bf0bef47392489c3c0a559

echo "===== DOCUMENTATION BOUNDARY ====="
test -s docs/local-docker-demo.md
grep -q 'SOAR actions are simulations only' \
  docs/local-docker-demo.md
grep -q 'not calibrated attack probabilities' \
  docs/local-docker-demo.md

echo "PASS: Honest capability limitations documented"

echo "===== WHITESPACE ====="
git diff --check

echo "SECURITY AND CONFIGURATION CHECK PASSED"
