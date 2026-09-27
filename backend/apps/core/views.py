import platform

import django
from django.conf import settings
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
from django.urls import get_resolver
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from .catalog import api_endpoints
from .selectors import database_is_available


@api_view(["GET"])
@permission_classes([AllowAny])
def healthcheck(request: Request) -> Response:
    """Basic liveness + DB connectivity check."""
    return Response({"status": "ok", "database": database_is_available()})


def index(request: HttpRequest) -> HttpResponse:
    """Human-friendly landing page for the API server."""
    debug = settings.DEBUG
    show_credentials = debug and settings.DEV_ADMIN_USERNAME and settings.DEV_ADMIN_PASSWORD
    context = {
        "debug": debug,
        "database_ok": database_is_available(),
        "endpoints": [
            e
            for e in api_endpoints(urlpatterns=get_resolver().url_patterns, prefix="/")
            if e.path.startswith("/api/")
        ],
        "frontend_url": settings.FRONTEND_URL,
        # Versions and credentials help in development and leak information in production.
        "versions": (
            {"Django": django.get_version(), "Python": platform.python_version()} if debug else {}
        ),
        "admin_credentials": (
            {"username": settings.DEV_ADMIN_USERNAME, "password": settings.DEV_ADMIN_PASSWORD}
            if show_credentials
            else None
        ),
    }
    return render(request, "core/index.html", context)
