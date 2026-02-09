from django.contrib.auth.models import AbstractUser
from django.db.models import CharField
from django.db.models.enums import TextChoices
from django.utils.translation import gettext_lazy as _
from users.models.managers import UserManager


class User(AbstractUser):
    class Role(TextChoices):
        ADMIN = "ADMIN", "admin"
        OPERATOR = "OPERATOR", "main"
        EXECUTOR = "EXECUTOR", "executor"

    username = None
    UserManager()
    login = CharField(max_length=150, unique=True)
    phone = CharField(_('Telefon raqam'), max_length=13, unique=True)
    role = CharField(max_length=11, choices=Role.choices, default=Role.EXECUTOR)

    USERNAME_FIELD = "login"
    REQUIRED_FIELDS = ["phone"]

    def __str__(self):
        return self.login
