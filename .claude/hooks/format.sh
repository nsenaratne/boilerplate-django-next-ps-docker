#!/usr/bin/env bash
# PostToolUse hook for Edit/Write: formats the edited file inside the running containers.
# Never blocks. If the stack isn't running or a tool fails, it quietly does nothing.
set -uo pipefail

input="$(cat)"

if command -v jq >/dev/null 2>&1; then
  file="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')"
elif command -v python3 >/dev/null 2>&1; then
  file="$(printf '%s' "$input" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("file_path",""))')"
else
  exit 0
fi

[ -z "$file" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
rel="${file#"$root"/}"
cd "$root" || exit 0

running() { docker compose ps --status running --services 2>/dev/null | grep -qx "$1"; }

case "$rel" in
  backend/*.py)
    running backend || exit 0
    path="${rel#backend/}"
    docker compose exec -T backend ruff format --quiet "$path" >/dev/null 2>&1
    docker compose exec -T backend ruff check --fix --quiet "$path" >/dev/null 2>&1
    ;;
  frontend/src/*.ts|frontend/src/*.tsx)
    running frontend || exit 0
    path="${rel#frontend/}"
    docker compose exec -T frontend npx eslint --fix "$path" >/dev/null 2>&1
    ;;
esac

exit 0
