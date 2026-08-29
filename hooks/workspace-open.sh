#!/usr/bin/env bash

WORKSPACE_ROOT="${CURSOR_PROJECT_DIR:-$PWD}"

npx -y @memoraone/mcp@staging plugin-pair \
  --workspace-root "$WORKSPACE_ROOT" \
  --source cursor \
  --api-url "https://api.memoraone.com" \
  | while IFS= read -r line; do
      authorization_url="$(printf '%s\n' "$line" | sed -n 's/.*"authorizationUrl":"\([^"]*\)".*/\1/p')"
      if [ -n "$authorization_url" ]; then
        open "$authorization_url"
      fi
    done
