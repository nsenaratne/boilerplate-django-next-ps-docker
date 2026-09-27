"""API v1. Each app owns its routes in apps/<app>/urls.py; this file only mounts them."""

from django.urls import include, path

urlpatterns = [
    path("", include("apps.core.urls")),
    path("auth/", include("apps.authentication.urls")),
    path("", include("apps.users.urls")),
]
