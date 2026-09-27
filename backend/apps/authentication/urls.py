from django.urls import path

from .views import CsrfApi, LoginApi, LogoutApi

urlpatterns = [
    path("csrf/", CsrfApi.as_view(), name="auth-csrf"),
    path("login/", LoginApi.as_view(), name="auth-login"),
    path("logout/", LogoutApi.as_view(), name="auth-logout"),
]
