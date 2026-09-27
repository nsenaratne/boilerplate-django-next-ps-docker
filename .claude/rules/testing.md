---
paths:
  - "backend/**/tests/**"
  - "backend/**/test_*.py"
  - "e2e/**"
---

# Testing

## Backend (pytest + pytest-django)
- Tests live in `backend/apps/<app>/tests/test_<thing>.py`.
- Run with `make test`. This uses `config.settings.test` against the Docker Postgres.
- Mark DB tests with `@pytest.mark.django_db`. Use DRF's `APIClient` for endpoint tests.
- For every endpoint, test: happy path, unauthenticated (401/403), invalid input (400),
  and not-found (404) where relevant.
- Build test data with small factory functions in `tests/factories.py`. Don't use fixtures that
  depend on DB state from other tests.
- Tests must be independent and order-agnostic.

## E2E (Playwright)
- Specs live in `e2e/tests/*.spec.ts` and run with `make e2e` against the running dev stack.
- Select elements by role/label/text (`getByRole`, `getByLabel`). Never use CSS classes.
  Add `data-testid` only as a last resort.
- Use web-first assertions (`await expect(locator).toBeVisible()`). Never use `waitForTimeout`.
- Each spec creates the data it needs. Don't rely on state left by another spec.
- Cover user-visible flows only. Logic belongs in backend unit tests.

## When to write which
- Model/service/serializer logic → pytest.
- A new page or user flow → at least one Playwright spec.
- Bug fix → a failing test first, then the fix.
