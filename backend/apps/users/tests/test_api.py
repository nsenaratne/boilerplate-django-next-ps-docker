import pytest
from rest_framework.test import APIClient

from .factories import make_user


@pytest.mark.django_db
def test_me_returns_current_user():
    user = make_user(email="alice@example.com")
    client = APIClient()
    client.force_authenticate(user)

    response = client.get("/api/v1/users/me/")

    assert response.status_code == 200
    assert response.json() == {
        "id": str(user.pk),
        "username": "alice",
        "email": "alice@example.com",
        "first_name": "",
        "last_name": "",
    }


@pytest.mark.django_db
def test_me_requires_authentication():
    response = APIClient().get("/api/v1/users/me/")
    assert response.status_code in (401, 403)


@pytest.mark.django_db
def test_list_only_includes_current_user():
    alice = make_user(username="alice")
    make_user(username="bob")
    client = APIClient()
    client.force_authenticate(alice)

    response = client.get("/api/v1/users/")

    assert response.status_code == 200
    assert [u["username"] for u in response.json()["results"]] == ["alice"]


@pytest.mark.django_db
def test_retrieve_other_user_is_not_found():
    alice = make_user(username="alice")
    bob = make_user(username="bob")
    client = APIClient()
    client.force_authenticate(alice)

    assert client.get(f"/api/v1/users/{bob.pk}/").status_code == 404
