from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.serializers import UserSerializer

from .serializers import LoginInputSerializer
from .services import session_login, session_logout
from .throttles import LoginRateThrottle


class CsrfProtectedAPIView(APIView):
    """Checks the CSRF token even for anonymous callers.

    DRF only enforces CSRF for requests that are already session-authenticated. Login and
    logout need it regardless, so another site can't sign a visitor in or out.
    """

    def initial(self, request: Request, *args: object, **kwargs: object) -> None:
        SessionAuthentication().enforce_csrf(request)
        super().initial(request, *args, **kwargs)


@method_decorator(ensure_csrf_cookie, name="get")
class CsrfApi(APIView):
    """Sets the csrftoken cookie the frontend echoes back in X-CSRFToken."""

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        return Response(status=status.HTTP_204_NO_CONTENT)


class LoginApi(CsrfProtectedAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request: Request) -> Response:
        serializer = LoginInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = session_login(request=request._request, **serializer.validated_data)
        return Response(UserSerializer(user).data)


class LogoutApi(CsrfProtectedAPIView):
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        session_logout(request=request._request)
        return Response(status=status.HTTP_204_NO_CONTENT)
