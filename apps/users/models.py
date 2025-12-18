from django.contrib.auth.models import AbstractUser
from django.db import models
from rest_framework.fields import CharField


# Create your models here.

class User(AbstractUser):
    username=CharField(max_length=30, unique=True)
    password=CharField(max_length=11, unique=True)
