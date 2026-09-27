from django.db.models import QuerySet
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from .models import User
from .selectors import users_visible_to
from .serializers import UserSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """Users visible to the caller, plus the caller themselves at /users/me/."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[User]:
        return users_visible_to(user=self.request.user)

    @action(detail=False, methods=["get"])
    def me(self, request: Request) -> Response:
        return Response(self.get_serializer(request.user).data)
