from django.contrib.auth.models import AbstractUser
from django.db.models import CharField

from users.models.managers import UserManager


class User(AbstractUser):
    username = None  # ❌ butunlay o‘chadi

    login = CharField(max_length=150, unique=True)
    phone = CharField(max_length=13, unique=True)
    # password = CharField(max_length=255)

    objects = UserManager()

    USERNAME_FIELD = "login"
    REQUIRED_FIELDS = ["phone"]

    def __str__(self):
        return self.login
