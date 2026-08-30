#!/usr/bin/env bash

HOOK_INPUT="$(cat)"

WORKSPACE_ROOT="$(
  printf '%s' "$HOOK_INPUT" | node -e '
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(input);
    const roots = Array.isArray(data.workspace_roots) ? data.workspace_roots : [];
    if (typeof roots[0] === "string") process.stdout.write(roots[0]);
  } catch {}
});
'
)"

if [ -z "$WORKSPACE_ROOT" ]; then
  exit 0
fi

npx -y @memoraone/mcp@staging plugin-pair \
  --workspace-root "$WORKSPACE_ROOT" \
  --source cursor \
  --api-url "https://memora-api-staging-142288887239.us-east4.run.app" \
  | while IFS= read -r line; do
      authorization_url="$(printf '%s\n' "$line" | sed -n 's/.*"authorizationUrl":"\([^"]*\)".*/\1/p')"
      if [ -n "$authorization_url" ]; then
        open "$authorization_url"
      fi
    done
