#!/usr/bin/env bash
set -euo pipefail

# Project-local MCP launcher for Codex.
# WordPress runs in wp-env. Codex talks to the official MCP Adapter
# through Automattic's HTTP proxy so MCP stdout stays clean.

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
  {
    printf "export WP_API_URL='%s'\n" "http://localhost:8888/wp-json/mcp/mcp-adapter-default-server"
    printf "export WP_API_USERNAME='%s'\n" "admin"
    printf "export WP_API_PASSWORD='%s'\n" "$password"
  } > "$CREDENTIAL_FILE"
}

if [ ! -f "$CREDENTIAL_FILE" ]; then
  create_local_credentials
fi

# shellcheck disable=SC1090
source "$CREDENTIAL_FILE"

exec npx -y @automattic/mcp-wordpress-remote@latest
