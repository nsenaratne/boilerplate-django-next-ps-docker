# Deploy configuration

## Compose file
`docker-compose.prod.yml` has these services: `db`, `backend`, `frontend`, `nginx`.

## Required `.env` variables
| Variable               | Notes                                            |
| ---------------------- | ------------------------------------------------ |
| `DJANGO_SECRET_KEY`    | Long random string, not the example value.       |
| `POSTGRES_PASSWORD`    | Not `postgres`.                                  |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated hostnames, e.g. `example.com`.   |
| `CSRF_TRUSTED_ORIGINS` | Full origins, e.g. `https://example.com`.        |

## Optional
| Variable                     | Default   | Notes                                  |
| ---------------------------- | --------- | -------------------------------------- |
| `HTTP_PORT`                  | `80`      | Host port nginx listens on.            |
| `DJANGO_SECURE_SSL_REDIRECT` | `false`   | Set `true` once TLS is in front.       |
| `DJANGO_SUPERUSER_*`         | unset     | Creates an admin on first start.       |

## Health checks (after `up -d`)
- `http://localhost:${HTTP_PORT:-80}/api/v1/health/` → `{"status":"ok","database":true}`
- `http://localhost:${HTTP_PORT:-80}/` → 200 (Next.js)
- `http://localhost:${HTTP_PORT:-80}/admin/login/` → 200 (Django admin + static files)

## Rollback
Check out the previous commit, then run `docker compose -f docker-compose.prod.yml up -d --build`.
The database volume `db_data` persists across rebuilds. Migrations are forward-only,
so a model change that needs rolling back needs a new reverse migration.
