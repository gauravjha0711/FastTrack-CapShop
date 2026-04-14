#!/usr/bin/env bash
set -euo pipefail

SA_PASSWORD="${SA_PASSWORD:?SA_PASSWORD is required}"
SQL_HOST="${SQL_HOST:-sqlserver}"
SQL_PORT="${SQL_PORT:-1433}"

SQLCMD="/opt/mssql-tools/bin/sqlcmd"

echo "Waiting for SQL Server at ${SQL_HOST}:${SQL_PORT}..."

# Default: wait up to 10 minutes (300 * 2s) for the server to accept connections.
# Fail fast if credentials are rejected (waiting won't fix that).
MAX_RETRIES="${MAX_RETRIES:-300}"
SLEEP_SECONDS="${SLEEP_SECONDS:-2}"
LOGIN_TIMEOUT_SECONDS="${LOGIN_TIMEOUT_SECONDS:-5}"

last_error=""
for ((i=1; i<=MAX_RETRIES; i++)); do
  if output="$(${SQLCMD} -S "${SQL_HOST},${SQL_PORT}" -U sa -P "${SA_PASSWORD}" -l "${LOGIN_TIMEOUT_SECONDS}" -Q "SELECT 1" 2>&1)"; then
    last_error=""
    break
  fi

  last_error="$output"

  if echo "$output" | grep -qi "login failed"; then
    echo "SQL Server is reachable, but SA password was rejected." >&2
    echo "- Check that CAPSHOP_DOCKER_SA_PASSWORD in your .env matches the current 'sa' password inside the sqlserver volume." >&2
    echo "- If you changed CAPSHOP_DOCKER_SA_PASSWORD, SQL Server will NOT auto-update it when reusing the existing volume." >&2
    echo "- Fix by resetting the SA password inside the container or by removing the sqlserver volume (data loss)." >&2
    echo "sqlcmd output: $output" >&2
    exit 1
  fi

  sleep "${SLEEP_SECONDS}"
done

if [ -n "$last_error" ]; then
  echo "SQL Server did not become ready in time." >&2
  echo "Last sqlcmd error: $last_error" >&2
  exit 1
fi

echo "Creating databases (if missing)..."
${SQLCMD} -b -S "${SQL_HOST},${SQL_PORT}" -U sa -P "${SA_PASSWORD}" -i /scripts/create-databases.sql

echo "DB init complete."
