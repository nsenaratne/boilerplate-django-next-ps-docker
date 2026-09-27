---
name: deploy
description: Build, verify and start the production Docker stack (docker-compose.prod.yml behind nginx). Use when the user asks to deploy, ship, release, or run the production stack.
disable-model-invocation: true
---

# Deploy the production stack

Target settings (ports, required env vars, health URLs) are in [deploy-config.md](deploy-config.md).
Read it first.

Stop and report at the first failing step. Never skip a step or "fix forward" silently.

## 1. Pre-flight
1. `git status`: the working tree must be clean. If it isn't, stop and ask.
2. Confirm `.env` exists and sets every variable listed as **required** in deploy-config.md.
   Check with `grep -c '^VAR=' .env` per variable. **Never print or read the values.**
3. Confirm `DJANGO_SECRET_KEY` is not the default. `grep -q 'DJANGO_SECRET_KEY=change-me' .env`
   must return nothing.

## 2. Quality gates (on the dev stack)
1. `docker compose up -d --wait`
2. `make lint`
3. `make test`
4. `make e2e`
5. `docker compose exec backend python manage.py makemigrations --check --dry-run`.
   This must report no changes. Uncommitted model changes block the deploy.

## 3. Build & start production
1. `docker compose -f docker-compose.prod.yml build`
2. Ask the user for explicit confirmation before continuing.
3. `docker compose -f docker-compose.prod.yml up -d`

## 4. Verify
Poll each health URL in deploy-config.md for up to 60 s:
`curl -fsS <url>`. Then run `docker compose -f docker-compose.prod.yml ps` and confirm that no
service is restarting.

If verification fails: show `docker compose -f docker-compose.prod.yml logs --tail=100 backend frontend nginx`
and stop. Do **not** run `down -v`, because that deletes the production database.

## 5. Report
Give a short summary: commit SHA (`git rev-parse --short HEAD`), images built, health results.
