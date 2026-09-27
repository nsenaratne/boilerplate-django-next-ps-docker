#!/bin/sh
# Runs before every backend container command:
#   1. waits for Postgres
#   2. applies migrations
#   3. creates a superuser from DJANGO_SUPERUSER_* env vars (if set and missing)
#   4. collects static files in prod
set -e

echo "Waiting for database..."
python - <<'EOF'
import os, sys, time
import psycopg
url = os.environ["DATABASE_URL"]
for attempt in range(60):
    try:
        psycopg.connect(url, connect_timeout=2).close()
        sys.exit(0)
    except psycopg.OperationalError:
        time.sleep(1)
print("Database never became available", file=sys.stderr)
sys.exit(1)
EOF
echo "Database is up."

python manage.py migrate --noinput

if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  if python manage.py shell -v 0 -c "import os, sys; from django.contrib.auth import get_user_model; sys.exit(0 if get_user_model().objects.filter(username=os.environ['DJANGO_SUPERUSER_USERNAME']).exists() else 1)"; then
    echo "Superuser '$DJANGO_SUPERUSER_USERNAME' already exists."
  else
    python manage.py createsuperuser --noinput \
      && echo "Created superuser '$DJANGO_SUPERUSER_USERNAME'." \
      || echo "WARNING: could not create superuser (see error above)."
  fi
fi

case "$DJANGO_SETTINGS_MODULE" in
  *prod*) python manage.py collectstatic --noinput ;;
esac

exec "$@"
