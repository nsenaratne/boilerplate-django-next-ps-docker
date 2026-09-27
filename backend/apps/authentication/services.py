from django.contrib.auth import authenticate, login, logout
from django.http import HttpRequest

from apps.users.models import User

from .exceptions import InvalidCredentials


def session_login(*, request: HttpRequest, username: str, password: str) -> User:
    """Verify credentials and attach the user to the request's session.

    Raises InvalidCredentials for a wrong password or an inactive account. Django's
    login() also rotates the session key and CSRF token, which prevents session fixation.
    """
    user = authenticate(request, username=username, password=password)
    if not isinstance(user, User):
        raise InvalidCredentials()
    login(request, user)
    return user


def session_logout(*, request: HttpRequest) -> None:
    logout(request)
