import pytest
from django.contrib.auth.models import AnonymousUser

from apps.users.selectors import users_visible_to

from .factories import make_user


@pytest.mark.django_db
def test_users_visible_to_returns_only_self():
    alice = make_user(username="alice")
    make_user(username="bob")

    assert list(users_visible_to(user=alice)) == [alice]


@pytest.mark.django_db
def test_users_visible_to_anonymous_is_empty():
    make_user(username="alice")

    assert not users_visible_to(user=AnonymousUser()).exists()
