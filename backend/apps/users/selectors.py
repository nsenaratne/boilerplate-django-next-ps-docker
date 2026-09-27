from django.contrib.auth.models import AbstractBaseUser, AnonymousUser
from django.db.models import QuerySet

from .models import User


def users_visible_to(*, user: AbstractBaseUser | AnonymousUser) -> QuerySet[User]:
    """Users the given user may read. Today that is only themselves."""
    if not user.is_authenticated:
        return User.objects.none()
    return User.objects.filter(pk=user.pk)
