from django.urls import get_resolver

from apps.core.catalog import Endpoint, api_endpoints


def _by_path() -> dict[str, Endpoint]:
    endpoints = api_endpoints(urlpatterns=get_resolver().url_patterns, prefix="/")
    return {e.path: e for e in endpoints}


def test_lists_api_endpoints_with_methods_and_access():
    endpoints = _by_path()

    assert endpoints["/api/v1/health/"] == Endpoint(
        path="/api/v1/health/", methods=("GET",), name="healthcheck", public=True
    )
    assert endpoints["/api/v1/auth/login/"].methods == ("POST",)
    assert endpoints["/api/v1/auth/login/"].public
    assert not endpoints["/api/v1/users/me/"].public


def test_router_parameters_are_readable():
    endpoints = _by_path()

    assert "/api/v1/users/{pk}/" in endpoints
    assert not endpoints["/api/v1/users/{pk}/"].browsable
    assert endpoints["/api/v1/users/me/"].browsable


def test_non_drf_views_are_skipped():
    paths = _by_path()

    assert "/" not in paths
    assert not any(path.startswith("/admin/") for path in paths)
