---
paths:
  - "backend/**/*.py"
  - "frontend/src/**/*.{ts,tsx}"
  - "e2e/**/*.ts"
---

# Code style

## Python (backend/)
- Ruff is the formatter and linter (line length 100, config in `backend/pyproject.toml`).
  Run `docker compose exec backend ruff check --fix . && docker compose exec backend ruff format .`
- Use type hints on all function signatures. Use modern syntax: `list[str]`, `X | None`.
- One Django app per feature under `apps/`. Keep views thin and put business logic in
  `services.py` (writes) and `selectors.py` (reads) inside the app. Services and selectors
  take keyword-only arguments. See `architecture.md`.
- Models extend `apps.core.models.TimeStampedModel`. Always define `__str__` and `Meta.ordering`.
- Read settings with `env(...)` in `config/settings/base.py`. Never read `os.environ` in app code.
- Import order: stdlib, third-party, `apps.*` / `config.*` (ruff `I` rule enforces this).

## TypeScript (frontend/, e2e/)
- Strict mode, `noUncheckedIndexedAccess` on. Don't use `any`. Use `unknown` and narrow it.
- Import through the `@/` alias (`@/lib/api-client`, `@/features/auth`). Inside a feature, use
  relative imports. Never deep-import another feature (`@/features/auth/api/login`).
- Components: named exports, PascalCase files for components, kebab-case for everything else.
- Mark a file `"use client"` only when it uses state, effects, browser APIs or query hooks.
  Keep server components as the default.
- No inline `fetch`. Go through `apiClient` + a hook in `src/features/<feature>/api/`.
- Read configuration from `@/config/env`, never `process.env` in components.
- Validate untrusted data (form input, URL params) with `zod`.

## General
- Small, focused functions. Choose clear names over comments, and use comments to explain *why*.
- Don't leave `console.log`, `print()` or commented-out code in commits.
