from apps.core.exceptions import ApplicationError


class InvalidCredentials(ApplicationError):
    default_message = "Invalid username or password."
