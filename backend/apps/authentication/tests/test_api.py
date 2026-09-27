import pytest
from django.core.cache import cache
from rest_framework.test import APIClient

from apps.users.tests.factories import make_user


@pytest.fixture(autouse=True)
def _reset_throttle():
    cache.clear()
    yield
    cache.clear()


@pytest.mark.django_db
def test_login_starts_a_session():
    make_user(username="alice", password="pass12345")
    client = APIClient()

    response = client.post(
        "/api/v1/auth/login/", {"username": "alice", "password": "pass12345"}, format="json"
    )

    assert response.status_code == 200
    assert response.json()["username"] == "alice"
    assert "password" not in response.json()
    assert client.get("/api/v1/users/me/").status_code == 200


@pytest.mark.django_db
def test_login_rejects_wrong_password():
    make_user(username="alice", password="pass12345")

    response = APIClient().post(
        "/api/v1/auth/login/", {"username": "alice", "password": "nope"}, format="json"
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Invalid username or password."}


@pytest.mark.django_db
def test_login_rejects_inactive_user():
    make_user(username="alice", password="pass12345", is_active=False)

    response = APIClient().post(
        "/api/v1/auth/login/", {"username": "alice", "password": "pass12345"}, format="json"
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_login_requires_fields():
    response = APIClient().post("/api/v1/auth/login/", {}, format="json")

    assert response.status_code == 400
    assert set(response.json()) == {"username", "password"}


@pytest.mark.django_db
def test_login_requires_csrf_token():
    make_user(username="alice", password="pass12345")
    client = APIClient(enforce_csrf_checks=True)

    response = client.post(
        "/api/v1/auth/login/", {"username": "alice", "password": "pass12345"}, format="json"
    )

    assert response.status_code == 403


@pytest.mark.django_db
def test_login_accepts_csrf_token_from_cookie():
    make_user(username="alice", password="pass12345")
    client = APIClient(enforce_csrf_checks=True)

    assert client.get("/api/v1/auth/csrf/").status_code == 204
    token = client.cookies["csrftoken"].value
    response = client.post(
        "/api/v1/auth/login/",
        {"username": "alice", "password": "pass12345"},
        format="json",
        HTTP_X_CSRFTOKEN=token,
    )

    assert response.status_code == 200


@pytest.mark.django_db
def test_login_is_throttled():
    client = APIClient()
    for _ in range(10):
        client.post("/api/v1/auth/login/", {"username": "x", "password": "y"}, format="json")

    response = client.post("/api/v1/auth/login/", {"username": "x", "password": "y"}, format="json")

    assert response.status_code == 429


@pytest.mark.django_db
def test_logout_ends_the_session():
    user = make_user()
    client = APIClient()
    client.force_login(user)

    response = client.post("/api/v1/auth/logout/")

    assert response.status_code == 204
    assert client.get("/api/v1/users/me/").status_code == 403
