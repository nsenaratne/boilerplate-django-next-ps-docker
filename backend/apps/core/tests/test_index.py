import pytest
from django.test import Client, override_settings


@pytest.mark.django_db
def test_index_shows_status_and_endpoints():
    response = Client().get("/")

    assert response.status_code == 200
    html = response.content.decode()
    assert "Boilerplate API" in html
    assert "Connected" in html
    assert "/api/v1/users/me/" in html
    assert "Login required" in html


@pytest.mark.django_db
@override_settings(DEBUG=False, DEV_ADMIN_USERNAME="admin", DEV_ADMIN_PASSWORD="s3cret")
def test_index_hides_credentials_and_versions_outside_debug():
    html = Client().get("/").content.decode()

    assert "s3cret" not in html
    assert "Python" not in html


@pytest.mark.django_db
@override_settings(DEBUG=True, DEV_ADMIN_USERNAME="admin", DEV_ADMIN_PASSWORD="s3cret")
def test_index_shows_dev_credentials_in_debug():
    html = Client().get("/").content.decode()

    assert "s3cret" in html
    assert "Development server" in html
