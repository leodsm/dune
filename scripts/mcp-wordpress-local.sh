#!/usr/bin/env bash
set -euo pipefail

# Project-local MCP launcher for Codex.
# The WordPress site runs in wp-env. Codex talks to the official MCP Adapter
# through Automattic's HTTP proxy, which keeps MCP stdout clean.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CREDENTIAL_FILE="$ROOT_DIR/.arrakis-mcp.local"

cd "$ROOT_DIR"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx não encontrado. Instale Node.js LTS." >&2
  exit 1
fi

if ! npx wp-env status >/dev/null 2>&1; then
  echo "O wp-env não está ativo. Rode: npm run env:start" >&2
  exit 1
fi

create_local_credentials() {
  local raw password

  raw="$(npx wp-env run cli wp user application-password create admin "Arrakis Codex MCP" --porcelain 2>/dev/null || true)"

  password="$(printf '%s\n' "$raw" | grep -Eo '([[:alnum:]]{4}[[:space:]]){5}[[:alnum:]]{4}|[[:alnum:]]{24}' | tail -n 1 || true)"

  if [ -z "$password" ]; then
    echo "Não foi possível criar a Application Password local do WordPress." >&2
    echo "Confirme que o WordPress está ativo e rode: npm run wp:status" >&2
    exit 1
  fi

  umask 077
  cat > "$CREDENTIAL_FILE" <<EOF
WP_API_URL=http://localhost:8888/wp-json/mcp/mcp-adapter-default-server
WP_API_USERNAME=admin
WP_API_PASSWORD=$password
EOF
}

if [ ! -f "$CREDENTIAL_FILE" ]; then
  create_local_credentials
fi

set -a
# shellcheck disable=SC1090
source "$CREDENTIAL_FILE"
set +a

exec npx -y @automattic/mcp-wordpress-remote@latest
