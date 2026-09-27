# AGENTS.md

Shared instructions for any AI coding agent (Claude Code, Codex, Cursor, Copilot).
Claude Code imports this file from `CLAUDE.md`, so keep tool-agnostic guidance here.

## Project

Docker-first web application boilerplate.

- **backend/**: Django 6 on Python 3.14, Django REST Framework, Postgres 18 via `psycopg` 3
- **frontend/**: Next.js 16 (App Router), TypeScript (strict), TanStack Query v5
- **e2e/**: Playwright tests, run in their own container
- **infra/nginx/**: reverse proxy for the production stack

Everything runs in Docker. Do **not** assume Python, Node or Postgres are installed
on the host. Run tools inside the containers (see Commands).

## Commands

Start the stack first: `docker compose up -d` (or `make upd`).

| Task                    | Command                                           |
| ----------------------- | ------------------------------------------------- |
| Start / stop            | `make upd` / `make down`                          |
| Logs                    | `make logs s=backend`                             |
| Backend tests           | `make test`                                       |
| Lint everything         | `make lint`                                       |
| Make + apply migrations | `make makemigrations && make migrate`             |
| Django shell / psql     | `make shell` / `make dbshell`                     |
| E2E tests               | `make e2e`                                        |
| Any backend command     | `docker compose exec backend <cmd>`               |
| Any frontend command    | `docker compose exec frontend <cmd>`              |

Add a Python dependency to `backend/pyproject.toml`, then run `docker compose up -d --build backend`.
Add an npm dependency with `docker compose exec frontend npm install <pkg>`.

## Layout

Both sides are organised by feature. Full rules: `.claude/rules/architecture.md`.

```
backend/config/settings/        base.py (shared) · dev · prod · test
backend/apps/<feature>/         one Django app per feature: models, selectors (reads),
                                services (writes), exceptions, serializers, views, urls, tests/
backend/apps/core/              TimeStampedModel, ApplicationError + handler, health, API landing page
backend/apps/users/             User model, /users/ and /users/me/
backend/apps/authentication/    session login/logout/csrf
backend/api/v1/urls.py          mounts each app's urls.py under /api/v1/
frontend/src/app/               routes only; pages compose features
frontend/src/features/<name>/   api/, components/, schemas/, types.ts, index.ts (public API)
frontend/src/components/ui/     shadcn/ui primitives
frontend/src/lib/api-client.ts  the only place that calls fetch()
frontend/src/config/env.ts      validated NEXT_PUBLIC_* settings
e2e/tests/                      Playwright specs
```

## Conventions (short version; details live in `.claude/rules/`)

- New backend features go in `backend/apps/<name>/`, with `name = "apps.<name>"` in `apps.py`.
  Business logic lives in `services.py` / `selectors.py`; views stay thin.
- Models extend `apps.core.models.TimeStampedModel` (UUID pk + timestamps).
- The API is versioned under `/api/v1/`. Use DRF ViewSets + routers and paginated list endpoints.
  Each app owns its `urls.py`.
- New frontend features go in `src/features/<name>/` and are imported only through their
  `index.ts` (ESLint enforces this). Data access goes through `apiClient` and a hook in the
  feature's `api/`. Never call `fetch` from components.
- TypeScript is strict. Don't use `any`, `@ts-ignore` or non-null `!` without a comment explaining why.
- Every change ships with tests: pytest for the backend, Playwright for user-facing flows.
- Never commit `.env`, secrets, or edits to applied migrations. Add a new migration instead.

## Definition of done

1. `make lint` passes
2. `make test` passes
3. `make e2e` passes if UI or API behaviour changed
4. New migrations are committed if models changed
