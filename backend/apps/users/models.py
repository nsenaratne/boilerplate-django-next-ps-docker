import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model — extend freely, swapping later is painful."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta(AbstractUser.Meta):
        ordering = ["username"]

    def __str__(self) -> str:
        return self.username or self.email
