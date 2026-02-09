import re

from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.fields import CharField, IntegerField
from rest_framework.serializers import ModelSerializer, Serializer
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User


class UserModelSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "login", "phone", "role")
        write_only_fields = ("password",)


class LoginModelSerializer(Serializer):
    login = CharField()
    password = CharField(write_only=True)

    def validate(self, attrs):
        login = attrs.get("login")
        password = attrs.get("password")

        user = authenticate(
            request=self.context.get("request"),
            login=login,
            password=password
        )

        if not user:
            raise serializers.ValidationError("Login yoki parol noto‘g‘ri")

        if not user.is_active:
            raise serializers.ValidationError("Foydalanuvchi aktiv emas")

        self.user = user
        return attrs

    def get_tokens(self):
        refresh = RefreshToken.for_user(self.user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserModelSerializer(self.user).data
        }


class SendSmsCodeSerializer(ModelSerializer):
    phone = CharField(default='933977090')

    def validate_phone(self, value):
        digits = re.findall(r'\d', value)
        if len(digits) < 9:
            raise ValidationError('Phone number must be at least 9 digits')
        phone = ''.join(digits)
        return phone.removeprefix('998')

    def validate(self, attrs):
        phone = attrs['phone']
        if not User.objects.filter(phone=phone).exists():
            raise ValidationError('Phone number isn`t registered ')
        return attrs

    class Meta:
        model = User
        fields = ['phone']


class ChangePasswordSerializer(Serializer):
    phone = CharField(default='933977090')
    code = IntegerField(default=707070)
    token_class = RefreshToken
    new_password = CharField(write_only=True)

    def validate(self, attrs):
        self.user = User.objects.filter(phone=attrs['phone']).first()
        if not self.user:
            raise ValidationError("User not found")
        return attrs

    def save(self):
        self.user.set_password(self.validated_data['new_password'])
        self.user.save()
        return self.user

    @property
    def get_data(self):
        refresh = self.get_token(self.user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserModelSerializer(self.user).data
        }

    @classmethod
    def get_token(cls, user):
        return cls.token_class.for_user(user)


class ExecutorListModelSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "login", "role")
