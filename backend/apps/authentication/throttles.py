from rest_framework.request import Request
from rest_framework.throttling import SimpleRateThrottle
from rest_framework.views import APIView


class LoginRateThrottle(SimpleRateThrottle):
    """Limits login attempts per client IP to slow down password guessing.

    The rate comes from REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["login"].
    """

    scope = "login"

    def get_cache_key(self, request: Request, view: APIView) -> str:
        return self.cache_format % {"scope": self.scope, "ident": self.get_ident(request)}
