#!/usr/bin/env bash

# ==============================================================================
# TERRANOVA SCREENSHOT RUNNER
# Usage:
#   ./capture-screenshots.sh           # Capture standard suite (Desktop + Mobile + RTL)
#   ./capture-screenshots.sh --full    # Capture all variations (Dark, Light, RTL)
#   ./capture-screenshots.sh --desktop # Capture desktop only
#   ./capture-screenshots.sh --mobile  # Capture mobile only
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

export NODE_PATH="/usr/local/lib/node_modules/@playwright/mcp/node_modules:$DIR/backend/node_modules:$NODE_PATH"

ARGS=()

for arg in "$@"; do
  case $arg in
    --full)
      ARGS+=("--mode=all" "--full-page")
      ;;
    --desktop)
      ARGS+=("--mode=desktop")
      ;;
    --mobile)
      ARGS+=("--mode=mobile")
      ;;
    --full-page)
      ARGS+=("--full-page")
      ;;
    *)
      ARGS+=("$arg")
      ;;
  esac
done

node scripts/capture-all.js "${ARGS[@]}"
