from apps.users.models import User


def make_user(username="alice", password="pass12345", **extra):
    return User.objects.create_user(username=username, password=password, **extra)
