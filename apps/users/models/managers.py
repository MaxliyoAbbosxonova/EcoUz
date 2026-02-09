from django.contrib.auth.models import UserManager as DjangoUserManager


class UserManager(DjangoUserManager):

    def create_user(self, login="tashkilot nomi", phone="933977090", password=None, **extra_fields):
        if not login:
            raise ValueError("Login majburiy")
        if not phone:
            raise ValueError("Phone majburiy")

        extra_fields.setdefault("is_active", True)

        user = self.model(
            login=login,
            phone=phone,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, login, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        return self.create_user(login, phone, password, **extra_fields)
