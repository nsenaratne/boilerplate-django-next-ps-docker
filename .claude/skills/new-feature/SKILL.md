---
name: new-feature
description: Scaffold a full vertical slice for a new domain/resource — Django app, model, serializer, ViewSet, API route, migration, pytest tests, TypeScript type, TanStack Query hooks, Next.js page and a Playwright spec. Use when the user asks to add a new feature, resource, entity, model or CRUD section.
argument-hint: <resource-name> [fields...]
---

# New feature: $ARGUMENTS

Build the slice in this order. Run the check at the end of each step before moving on.
The stack must be running (`docker compose up -d --wait`).

Naming: for resource `project`, use app `apps/projects`, model `Project`,
URL `/api/v1/projects/`, types `Project`, hooks `useProjects` / `useProject`,
page `/projects`.

## 1. Django app
```bash
docker compose exec backend sh -c "mkdir -p apps/<plural> && python manage.py startapp <plural> apps/<plural>"
```
- In `apps.py`, set `name = "apps.<plural>"` and `label = "<plural>"`.
- Add `"apps.<plural>"` to `INSTALLED_APPS` in `config/settings/base.py`.

## 2. Model → serializer → ViewSet → route
- The model extends `apps.core.models.TimeStampedModel`. Add the fields, `__str__` and `Meta.ordering`.
- Add `selectors.py` (reads, e.g. `<plural>_visible_to(*, user)`) and `services.py` (writes,
  e.g. `<singular>_create(*, owner, **fields)`), with domain errors in `exceptions.py`.
- Add `serializers.py` and a `ModelViewSet` in `views.py` with explicit `permission_classes`.
  `get_queryset()` calls the selector; `perform_create` / `perform_update` call services.
  Follow `.claude/rules/api-conventions.md` and `.claude/rules/architecture.md`.
- Register the ViewSet with a `SimpleRouter` in `apps/<plural>/urls.py`, then
  `include("apps.<plural>.urls")` in `backend/api/v1/urls.py`.
- Register the model in `admin.py`.
- Run `make makemigrations && make migrate`, then review the migration file.

✅ `curl -s http://localhost:8000/api/v1/<plural>/` returns a paginated response.

## 3. Backend tests
Add `apps/<plural>/tests/test_api.py` covering list, create, retrieve, update, delete,
unauthenticated access and invalid input, plus `test_services.py` / `test_selectors.py` for
the business logic.

✅ `make test` passes.

## 4. Frontend
Create `src/features/<plural>/`:
- `types.ts`: interface mirroring the serializer.
- `api/keys.ts`: key factory. One file per endpoint in `api/` with a request function and its
  hook: `use<Plural>()` (returns `Paginated<T>`), `use<Singular>(id)`, and create/update/delete
  mutations that invalidate keys.
- `components/`: the list UI with loading/error/empty states, built from `@/components/ui`.
- `index.ts`: export only what pages need.
Then add a thin `src/app/(dashboard)/<plural>/page.tsx` that renders the feature's component.

✅ `docker compose exec frontend npm run typecheck && docker compose exec frontend npm run lint`

## 5. E2E
Add `e2e/tests/<plural>.spec.ts` that opens `/<plural>` and asserts the heading and the empty state.

✅ `make e2e` passes.

## 6. Finish
Run `make lint`, then hand the change to the `code-reviewer` subagent. Summarize the files created.
