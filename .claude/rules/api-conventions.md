---
paths:
  - "backend/api/**"
  - "backend/apps/**/views.py"
  - "backend/apps/**/serializers.py"
  - "backend/apps/**/urls.py"
  - "frontend/src/features/*/api/**"
  - "frontend/src/features/*/types.ts"
  - "frontend/src/types/**"
  - "frontend/src/lib/api-client.ts"
---

# API conventions

## URLs
- All endpoints live under `/api/v1/`. Each app declares its routes in `apps/<app>/urls.py`,
  and `backend/api/v1/urls.py` only `include()`s them.
- Resource names are plural and kebab-case: `/api/v1/expert-profiles/`, `/api/v1/expert-profiles/{id}/`.
- Always use a trailing slash (Django default).
- Custom actions use DRF `@action`: `POST /api/v1/orders/{id}/cancel/`.

## Views & serializers
- Use `ModelViewSet` / `ReadOnlyModelViewSet` + a `SimpleRouter` in the app's `urls.py`. Use
  `APIView`s or function views only for one-off endpoints (like `health/`, `auth/login/`).
- Set `permission_classes` explicitly on every ViewSet. Don't rely on the global default.
- Scope `get_queryset()` to what the user may see by delegating to a selector. Never return
  `Model.objects.all()` for user-owned data.
- Business rules live in `services.py`. Services raise `ApplicationError` subclasses; the
  project exception handler turns them into `{"detail": ...}` responses.
- Use `select_related` / `prefetch_related` for nested data to avoid N+1 queries.
- Separate read and write serializers when the shapes differ.
- IDs are UUIDs. Timestamps are ISO 8601 UTC.

## Responses
- Lists are paginated: `{ "count", "next", "previous", "results": [...] }`.
- Errors use DRF's default shape (`{"detail": "..."}` or `{"field": ["msg"]}`). Don't invent
  new error formats.
- Status codes: 200 read/update, 201 create, 204 delete, 400 validation, 401/403 auth, 404 missing.

## Frontend side
- Every endpoint gets a TypeScript type in `src/features/<feature>/types.ts` that mirrors its
  serializer.
- Each endpoint gets a file in `src/features/<feature>/api/` exporting a plain request function
  (`getOrders`) and its hook (`useOrders`). Query keys come from a key factory:
  ```ts
  export const orderKeys = {
    all: ["orders"] as const,
    list: (filters: OrderFilters) => [...orderKeys.all, "list", filters] as const,
    detail: (id: string) => [...orderKeys.all, "detail", id] as const,
  };
  ```
- Mutations invalidate the narrowest affected keys in `onSuccess`.
- Import the `Paginated<T>` type for list responses instead of re-declaring it.
