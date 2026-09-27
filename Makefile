# Shortcuts for the Docker stack. Run `make` to see all commands.
DC      := docker compose
DC_PROD := docker compose -f docker-compose.prod.yml

.DEFAULT_GOAL := help
.PHONY: help up upd down restart build logs ps \
        migrate makemigrations createsuperuser shell dbshell \
        test lint e2e \
        prod-up prod-down prod-logs clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

# ---------- dev stack ----------
up: ## Start the dev stack (foreground, with logs)
	$(DC) up --build

upd: ## Start the dev stack in the background
	$(DC) up --build -d

down: ## Stop the dev stack
	$(DC) down

restart: ## Restart all dev services
	$(DC) restart

build: ## Rebuild images without starting
	$(DC) build

logs: ## Tail logs (make logs s=backend for one service)
	$(DC) logs -f $(s)

ps: ## Show running services
	$(DC) ps

# ---------- django ----------
migrate: ## Apply migrations
	$(DC) exec backend python manage.py migrate

makemigrations: ## Create migrations
	$(DC) exec backend python manage.py makemigrations

createsuperuser: ## Create a Django superuser interactively
	$(DC) exec backend python manage.py createsuperuser

shell: ## Django shell
	$(DC) exec backend python manage.py shell

dbshell: ## psql into Postgres
	$(DC) exec db psql -U postgres -d app

# ---------- quality ----------
test: ## Run backend tests (pytest) inside the container
	$(DC) exec -e DJANGO_SETTINGS_MODULE=config.settings.test backend pytest

lint: ## Lint backend (ruff) and frontend (tsc + eslint)
	$(DC) exec backend ruff check .
	$(DC) exec frontend npm run typecheck
	$(DC) exec frontend npm run lint

e2e: ## Run Playwright tests against the running dev stack
	$(DC) --profile test run --rm --build e2e

# ---------- production-style stack ----------
prod-up: ## Build + start the production stack behind nginx on :80
	$(DC_PROD) up -d --build

prod-down: ## Stop the production stack
	$(DC_PROD) down

prod-logs: ## Tail production logs
	$(DC_PROD) logs -f $(s)

# ---------- cleanup ----------
clean: ## Stop everything and DELETE volumes (database data included)
	$(DC) down -v --remove-orphans
	$(DC_PROD) down -v --remove-orphans
