from django.contrib import admin
from django.urls import include, path

from apps.core.views import index

urlpatterns = [
    path("", index, name="index"),
    path("admin/", admin.site.urls),
    path("api/v1/", include("api.v1.urls")),
]
