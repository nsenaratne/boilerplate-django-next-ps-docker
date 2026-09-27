---
paths:
  - "backend/apps/**"
  - "backend/api/**"
  - "frontend/src/**"
---

# Architecture

Both sides are organised **by feature**, not by technical layer. A feature owns everything it
needs, and other code reaches it only through a small public surface.

## Backend: one Django app per feature (HackSoft Django Styleguide)

```
apps/<feature>/
  models.py        data + invariants only (extend core.models.TimeStampedModel)
  selectors.py     READS:  functions returning querysets/objects. No side effects.
  services.py      WRITES: business logic. Raise ApplicationError subclasses, never HTTP errors.
  exceptions.py    domain errors (subclass apps.core.exceptions.ApplicationError)
  serializers.py   input validation + output shape. No business logic.
  views.py         thin HTTP layer: parse input → call service/selector → serialize output
  urls.py          the app's own routes; api/v1/urls.py only include()s them
  tests/           test_api.py (endpoints), test_services.py, test_selectors.py, factories.py
```

- Services and selectors take **keyword-only** arguments and have type hints:
  `def session_login(*, request, username, password) -> User`.
- Views never touch the ORM directly; `get_queryset()` delegates to a selector.
- `apps.core.exceptions.exception_handler` converts ApplicationError to `{"detail": ...}`
  with the error's `status_code`, so services stay free of DRF/HTTP imports.
- Apps may import another app's models, selectors and services, never its views.

## Frontend: feature modules (bulletproof-react layout)

```
src/app/                 routes only. Pages compose features; minimal logic.
  _components/           route-level pieces shared across pages (e.g. site header)
  providers.tsx          React Query, theme, toaster
src/features/<feature>/
  api/                   request function + TanStack Query hook per endpoint, key factory
  components/            UI for this feature
  schemas/               zod schemas for user input
  lib/                   feature-only helpers
  types.ts               API types mirroring the DRF serializers
  index.ts               PUBLIC API: the only file other code may import
src/components/ui/       shadcn/ui primitives (generated; edit sparingly)
src/components/          shared, feature-agnostic components
src/lib/                 api-client (the only fetch), api-error, csrf, query-client, utils
src/config/env.ts        every NEXT_PUBLIC_* variable, validated with zod
src/types/               cross-feature types (e.g. Paginated<T>)
```

Import direction is **shared → features → app**, enforced by ESLint `no-restricted-imports`:
- Import a feature only via `@/features/<name>`, never `@/features/<name>/<file>`.
  Inside a feature, use relative imports.
- `components/`, `lib/`, `config/`, `types/`, `hooks/` must not import features or `app/`.
- Features must not import `app/`. Cross-feature imports go through the other feature's index.

## SOLID, applied

- **Single responsibility:** views do HTTP, services do business rules, selectors do reads.
  On the frontend, the api-client, CSRF handling and error type are separate modules, and
  pages only compose feature components.
- **Open/closed:** extend by composition, not edits. `SystemStatusCard` takes extra rows as
  children; new domain errors subclass `ApplicationError` and the handler needs no change.
- **Liskov:** subclasses keep their parent's contract (every `ApplicationError` maps to the
  same error shape; `CsrfProtectedAPIView` behaves like `APIView` plus a CSRF check).
- **Interface segregation:** small, specific props and function signatures. Components take
  the data they render (`AccountCard({ user })`), not whole query results.
- **Dependency inversion:** business logic depends on abstractions it owns (domain errors,
  `apiClient`, `env`), not on transport details. Components never call `fetch` or read
  `process.env` directly.
