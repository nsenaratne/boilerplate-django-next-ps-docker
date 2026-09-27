#!/usr/bin/env bash
# PreToolUse hook for Bash: blocks destructive or secret-leaking commands.
# Claude Code sends the tool call as JSON on stdin. Exit 2 = block (stderr goes back to Claude).
set -euo pipefail

input="$(cat)"

if command -v jq >/dev/null 2>&1; then
  cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty')"
elif command -v python3 >/dev/null 2>&1; then
  cmd="$(printf '%s' "$input" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))')"
else
  exit 0 # no JSON parser available; don't block work
fi

[ -z "$cmd" ] && exit 0

block() {
  echo "Blocked by .claude/hooks/validate-bash.sh: $1" >&2
  echo "Command: $cmd" >&2
  echo "If this is really intended, ask the user to run it themselves." >&2
  exit 2
}

# Normalise whitespace for matching
c="$(printf '%s' "$cmd" | tr -s '[:space:]' ' ')"

# --- Data loss ---
[[ "$c" =~ docker[\ -]compose.*down.*(-v|--volumes) ]] && block "'down -v' deletes the Postgres volume (all data)."
[[ "$c" =~ docker\ volume\ (rm|prune) ]]               && block "removing Docker volumes deletes database data."
[[ "$c" =~ docker\ system\ prune ]]                    && block "system prune can delete volumes and images."
[[ "$c" =~ make\ clean ]]                              && block "'make clean' deletes the database volume."
[[ "$c" =~ (DROP|TRUNCATE)\ (DATABASE|TABLE|SCHEMA) ]] && block "destructive SQL."
[[ "$c" =~ manage\.py\ (flush|reset_db) ]]             && block "wipes the database."
[[ "$c" =~ rm\ -[a-zA-Z]*r[a-zA-Z]*f?\ +(/|~|\$HOME|\.)(\ |$) ]] && block "recursive delete of a root/home/project directory."

# --- Git history ---
[[ "$c" =~ git\ push.*(--force|-f)(\ |$) ]] && [[ ! "$c" =~ --force-with-lease ]] && block "force push. Use --force-with-lease on a feature branch."
[[ "$c" =~ git\ push.*\ (main|master)(\ |$) ]] && block "direct push to main/master. Open a PR instead."
[[ "$c" =~ git\ reset\ --hard ]]            && block "'reset --hard' discards uncommitted work."

# --- Secrets ---
[[ "$c" =~ (cat|less|more|head|tail|bat|strings)\ [^|]*\.env(\ |$|\.) ]] && [[ ! "$c" =~ \.env\.example ]] && block "reading .env would expose secrets."
[[ "$c" =~ (printenv|env)(\ |$) ]] && [[ "$c" =~ ^(printenv|env)(\ *)$ ]] && block "dumping the environment may expose secrets."

# --- Remote code execution ---
[[ "$c" =~ (curl|wget)[^|]*\|\ *(sudo\ )?(ba|z)?sh ]] && block "piping a download into a shell."

exit 0
