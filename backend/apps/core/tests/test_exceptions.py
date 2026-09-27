from apps.core.exceptions import ApplicationError, exception_handler


class _Boom(ApplicationError):
    default_message = "Boom."
    status_code = 409


def test_application_error_uses_drf_error_shape():
    response = exception_handler(_Boom(), {})

    assert response is not None
    assert response.status_code == 409
    assert response.data == {"detail": "Boom."}


def test_other_exceptions_fall_through_to_drf():
    assert exception_handler(ValueError("x"), {}) is None
