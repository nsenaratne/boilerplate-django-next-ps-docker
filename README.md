# Boilerplate

A Docker-first starter for any web application:

| Layer    | Tech                                                   |
| -------- | ------------------------------------------------------ |
| Backend  | Django 6 · Python 3.14 · Django REST Framework         |
| Frontend | Next.js 16 (App Router) · TypeScript · TanStack Query  |
| Database | PostgreSQL 18                                          |
| E2E      | Playwright (in its own container)                      |
| Proxy    | nginx (production stack)                               |

The only thing you need installed is **Docker** (Docker Desktop on macOS/Windows).

---

## Run it

```bash
docker compose up
```

That's it — no `.env` file, no local Python or Node. On first start it will:

1. start Postgres 18 and wait until it's healthy
2. run Django migrations
3. create an admin user (**admin / admin**)
4. start the Next.js dev server once the API is healthy

| What          | URL                                  |
| ------------- | ------------------------------------ |
| App           | http://localhost:3000                |
| API overview  | http://localhost:8000/               |
| API health    | http://localhost:8000/api/v1/health/ |
| Django admin  | http://localhost:8000/admin/         |
| Postgres      | `localhost:5432` (postgres/postgres) |

The app calls the API on its own origin (`http://localhost:3000/api/v1/...`); the Next.js dev
server proxies those requests to Django, just as nginx does in production.

Code in `backend/` and `frontend/` is mounted into the containers, so edits
hot-reload instantly.

### With `make` (optional shortcuts)

```bash
make            # list all commands
make up         # start dev stack        make down     # stop it
make logs s=backend                      make ps
make migrate    make makemigrations      make shell    make dbshell
make test       # pytest in the backend container
make lint       # ruff + tsc + eslint
make e2e        # Playwright tests against the running stack
make prod-up    # production stack behind nginx on :80
make clean      # stop everything and DELETE the database volume
```

---

## Configuration

Everything has a default. To change something:

```bash
cp .env.example .env
```

Common tweaks: ports (`FRONTEND_PORT`, `BACKEND_PORT`, `POSTGRES_PORT`) if
something on your machine already uses 3000/8000/5432, admin credentials,
and `COMPOSE_PROJECT_NAME` to run several copies side by side.

---

## E2E tests (Playwright)

With the dev stack running:

```bash
docker compose --profile test run --rm e2e     # or: make e2e
```

Runs in the official Playwright image (Chromium, Firefox, WebKit preinstalled).
The HTML report lands in `e2e/playwright-report/`.
When bumping `@playwright/test`, bump the image tag in `e2e/Dockerfile` to the same version.

---

## Production stack

```bash
docker compose -f docker-compose.prod.yml up -d --build   # or: make prod-up
```

- Django served by gunicorn, running as a non-root user
- Next.js built in `standalone` mode (small image, non-root)
- nginx on port 80 routes `/api/` and `/admin/` to Django, `/static/` from a
  shared volume, everything else to Next.js — one origin, so no CORS
- Superuser is only created if you set `DJANGO_SUPERUSER_*` in `.env`

Before deploying for real, set in `.env`: `DJANGO_SECRET_KEY`, `POSTGRES_PASSWORD`,
`DJANGO_ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, and `DJANGO_SECURE_SSL_REDIRECT=true`
once TLS terminates in front of nginx.

---

## Project layout

```
.
├── docker-compose.yml         # dev stack (default)
├── docker-compose.prod.yml    # production stack behind nginx
├── Makefile                   # shortcuts
├── .env.example               # optional overrides
├── backend/
│   ├── Dockerfile             # dev + prod targets (uv, Python 3.14)
│   ├── entrypoint.sh          # wait for DB → migrate → superuser → run
│   ├── config/settings/       # base / dev / prod / test
│   ├── apps/core/             # base model, errors, health check, API landing page at /
│   ├── apps/users/            # custom User model, /users/me/
│   ├── apps/authentication/   # session login / logout / csrf
│   └── api/v1/urls.py         # mounts each app's urls.py
├── frontend/
│   ├── Dockerfile             # dev + prod (standalone) targets
│   └── src/
│       ├── app/               # routes only: /, /login, /dashboard
│       ├── features/          # auth, users, health: api/, components/, index.ts
│       ├── components/ui/     # shadcn/ui primitives
│       ├── lib/               # api-client, csrf, query-client
│       └── config/env.ts      # validated NEXT_PUBLIC_* settings
├── e2e/                       # Playwright (own Dockerfile)
├── infra/nginx/nginx.conf
└── .github/workflows/ci.yml   # builds + tests the stack with Docker
```

## Adding a feature

1. **Backend:** `docker compose exec backend sh -c "mkdir -p apps/<name> && python manage.py startapp <name> apps/<name>"`,
   set `name = "apps.<name>"` in its `apps.py`, add it to `INSTALLED_APPS`, put logic in
   `selectors.py` / `services.py`, give it a `urls.py` and include it from `api/v1/urls.py`,
   then `make makemigrations && make migrate`.
2. **Frontend:** create `src/features/<name>/` (types, `api/` hooks, components, `index.ts`)
   and a thin page under `src/app/`. See `.claude/rules/architecture.md`.
3. **E2E:** add a spec in `e2e/tests/`.

## Troubleshooting

- **Port already in use** → set `FRONTEND_PORT` / `BACKEND_PORT` / `POSTGRES_PORT` in `.env`.
- **Added an npm package** → just restart: `docker compose restart frontend`
  (it runs `npm install` on start).
- **Added a Python package** → add it to `backend/pyproject.toml`, then
  `docker compose up --build backend`.
- **Start from a clean database** → `make clean` (deletes all data).

## Claude Code setup

The repo is ready for Claude Code (and other AI agents):

```
CLAUDE.md               # loaded every session; imports AGENTS.md
CLAUDE.local.md         # your personal notes (gitignored)
AGENTS.md               # shared instructions for Codex/Cursor/Copilot too
.mcp.json               # MCP servers: postgres (dev DB), playwright (browser), github
.claude/
├── settings.json       # permissions (allow make/docker, deny .env + volume wipes) + hooks
├── settings.local.json # your personal overrides (gitignored)
├── rules/              # code-style, testing, api-conventions (path-scoped)
├── skills/
│   ├── deploy/         # /deploy: production checklist (manual only)
│   └── new-feature/    # /new-feature <name>: full vertical slice scaffold
├── agents/             # code-reviewer, security-auditor subagents
└── hooks/
    ├── validate-bash.sh  # blocks destructive commands (down -v, force push, cat .env…)
    └── format.sh         # ruff / eslint on edited files when the stack is running
```
