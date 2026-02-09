from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class UserAdmin(UserAdmin):
    model = User
    list_display = ('id', "login", "phone", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")

    ordering = ("login",)

    fieldsets = (
        (None, {"fields": ("login", "phone", "password")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "groups", "user_permissions")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("login", "phone", "password1", "password2"),
        }),
    )

    search_fields = ("login", "phone")
