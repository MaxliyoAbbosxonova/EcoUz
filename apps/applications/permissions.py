import jwt
from django.conf import settings
from rest_framework.permissions import BasePermission
from users.models import User


class IsOperator(BasePermission):
    def has_permission(self, request, view):
        # Header: Authorization: Bearer <token>
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return False

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return False

        token = parts[1]

        try:
            # Tokenni decode qilish
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get('user_id')
            if not user_id:
                return False

            # Userni database'dan olish
            user = User.objects.get(id=user_id)

            # Role tekshirish
            return user.role == 'OPERATOR'

        except (jwt.ExpiredSignatureError, jwt.DecodeError, User.DoesNotExist):
            return False


class IsExecutor(BasePermission):
    def has_permission(self, request, view):
        # Header: Authorization: Bearer <token>
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return False

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return False

        token = parts[1]

        try:
            # Tokenni decode qilish
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get('user_id')
            if not user_id:
                return False

            # Userni database'dan olish
            user = User.objects.get(id=user_id)

            # Role tekshirish
            return user.role == 'EXECUTOR'

        except (jwt.ExpiredSignatureError, jwt.DecodeError, User.DoesNotExist):
            return False
