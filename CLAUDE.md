# CLAUDE.md

@AGENTS.md

## Claude Code specifics

- **Rules** in `.claude/rules/` load automatically for matching paths:
  `architecture.md` (feature-based layout + SOLID), `code-style.md` (all code), `testing.md` (tests),
  `api-conventions.md` (backend API + frontend API modules).
- **Skills**: `/new-feature <name>` scaffolds a full vertical slice (Django app → API → query hook → page → e2e).
  `/deploy` runs the production stack checklist.
- **Subagents**: use `code-reviewer` before finishing a non-trivial change, and
  `security-auditor` for anything touching auth, permissions, settings or user input.
- **MCP** (`.mcp.json`): `postgres` queries the dev database (stack must be running;
  override with `MCP_DATABASE_URL`), `playwright` drives a real browser against
  http://localhost:3000, `github` reads issues/PRs (authenticate via `/mcp`).
- **Hooks**: `validate-bash.sh` blocks destructive commands (volume wipes, force pushes, etc.).
  `format.sh` runs ruff/eslint on files you edit when the stack is up.

## Working style

- Check that the stack is running (`docker compose ps`) before running tests. If it isn't,
  start it with `docker compose up -d --wait`.
- Prefer `make` targets over long `docker compose` commands.
- After changing models, always run `make makemigrations`, review the generated file, then `make migrate`.
- Keep this file under 200 lines. Put detail in `.claude/rules/` or a skill.

Personal overrides go in `CLAUDE.local.md` (gitignored).
