"""Builds a list of API endpoints by walking the URLconf, so new apps appear automatically."""

import re
from collections.abc import Iterator
from dataclasses import dataclass

from django.urls import URLPattern, URLResolver
from rest_framework.permissions import AllowAny

_REGEX_GROUP = re.compile(r"\(\?P<(\w+)>[^)]*\)")
_ROUTE_PARAM = re.compile(r"<(?:\w+:)?(\w+)>")
_IGNORED_METHODS = {"options", "head", "trace"}


@dataclass(frozen=True)
class Endpoint:
    path: str
    methods: tuple[str, ...]
    name: str
    public: bool

    @property
    def browsable(self) -> bool:
        """Can be opened directly in a browser (GET with no path parameters)."""
        return "GET" in self.methods and "{" not in self.path


def _clean(path: str) -> str:
    path = path.replace("^", "").replace("$", "").replace("\\", "")
    path = _REGEX_GROUP.sub(r"{\1}", path)
    return _ROUTE_PARAM.sub(r"{\1}", path)


def _walk(patterns: list, prefix: str) -> Iterator[tuple[str, URLPattern]]:
    for pattern in patterns:
        if isinstance(pattern, URLResolver):
            yield from _walk(pattern.url_patterns, prefix + str(pattern.pattern))
        elif isinstance(pattern, URLPattern):
            yield prefix + str(pattern.pattern), pattern


def _describe(pattern: URLPattern) -> tuple[tuple[str, ...], bool]:
    callback = pattern.callback
    view_class = getattr(callback, "cls", None)
    if view_class is None:
        return (), False

    actions: dict[str, str] | None = getattr(callback, "actions", None)
    if actions:
        methods = tuple(m.upper() for m in actions)
    else:
        methods = tuple(
            m.upper()
            for m in view_class.http_method_names
            if m not in _IGNORED_METHODS and hasattr(view_class, m)
        )

    initkwargs: dict = getattr(callback, "initkwargs", {})
    permissions = initkwargs.get("permission_classes", view_class.permission_classes)
    public = all(issubclass(p, AllowAny) for p in permissions)
    return methods, public


def api_endpoints(*, urlpatterns: list, prefix: str) -> list[Endpoint]:
    endpoints = []
    for raw_path, pattern in _walk(urlpatterns, prefix):
        methods, public = _describe(pattern)
        if not methods:
            continue
        endpoints.append(
            Endpoint(path=_clean(raw_path), methods=methods, name=pattern.name or "", public=public)
        )
    return endpoints
