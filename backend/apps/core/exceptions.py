"""Domain errors and the DRF exception handler that turns them into HTTP responses.

Services raise ApplicationError subclasses and never import anything HTTP-related, so the
same business logic works from views, management commands, Celery tasks or tests.
"""

from typing import Any

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


class ApplicationError(Exception):
    """Base class for expected business-rule failures."""

    status_code: int = status.HTTP_400_BAD_REQUEST
    default_message: str = "The request could not be completed."

    def __init__(self, message: str | None = None) -> None:
        self.message = message or self.default_message
        super().__init__(self.message)


def exception_handler(exc: Exception, context: dict[str, Any]) -> Response | None:
    if isinstance(exc, ApplicationError):
        # Keep DRF's default error shape: {"detail": "..."}.
        return Response({"detail": exc.message}, status=exc.status_code)
    return drf_exception_handler(exc, context)
