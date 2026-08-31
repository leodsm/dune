#!/usr/bin/env bash
set -euo pipefail

# Project-local MCP transport for Codex.
# It runs the official WordPress MCP Adapter over STDIO inside wp-env.

if ! command -v npx >/dev/null 2>&1; then
  echo "npx não encontrado. Instale Node.js LTS." >&2
  exit 1
fi

exec npx wp-env run cli --env-cwd=wp-content/plugins/arrakis-core wp mcp-adapter serve \
  --server=mcp-adapter-default-server \
  --user=admin
