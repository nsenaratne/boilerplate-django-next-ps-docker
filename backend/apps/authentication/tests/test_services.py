import pytest
from django.contrib.auth.models import AnonymousUser
from django.contrib.sessions.middleware import SessionMiddleware
from django.http import HttpRequest, HttpResponse
from django.test import RequestFactory

from apps.authentication.exceptions import InvalidCredentials
from apps.authentication.services import session_login, session_logout
from apps.users.tests.factories import make_user


def _request_with_session() -> HttpRequest:
    request = RequestFactory().post("/")
    SessionMiddleware(lambda _: HttpResponse()).process_request(request)
    request.user = AnonymousUser()  # what AuthenticationMiddleware provides in a real request
    return request


@pytest.mark.django_db
def test_session_login_attaches_user():
    user = make_user(username="alice", password="pass12345")
    request = _request_with_session()

    result = session_login(request=request, username="alice", password="pass12345")

    assert result == user
    assert request.user == user
    assert request.session["_auth_user_id"] == str(user.pk)


@pytest.mark.django_db
@pytest.mark.parametrize(
    ("username", "password", "active"),
    [("alice", "wrong", True), ("nobody", "pass12345", True), ("alice", "pass12345", False)],
)
def test_session_login_rejects_bad_credentials(username, password, active):
    make_user(username="alice", password="pass12345", is_active=active)

    with pytest.raises(InvalidCredentials):
        session_login(request=_request_with_session(), username=username, password=password)


@pytest.mark.django_db
def test_session_logout_clears_session():
    make_user(username="alice", password="pass12345")
    request = _request_with_session()
    session_login(request=request, username="alice", password="pass12345")

    session_logout(request=request)

    assert "_auth_user_id" not in request.session
