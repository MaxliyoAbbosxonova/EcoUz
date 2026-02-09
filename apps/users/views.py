from applications.permissions import IsOperator
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from users.models import User
from users.serializers import (
    ChangePasswordSerializer,
    ExecutorListModelSerializer,
    LoginModelSerializer,
    SendSmsCodeSerializer,
    UserModelSerializer,
)
from users.utils import check_sms_code, random_code, send_sms_code


# Create your views here.
@extend_schema(tags=['Users'])
class UserListCreateApiView(ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserModelSerializer
    authentication_classes = ()


@extend_schema(tags=['Users'])
class LoginApiView(APIView):
    serializer_class = LoginModelSerializer
    authentication_classes = ()

    def post(self, request):
        serializer = self.serializer_class(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        return Response(
            serializer.get_tokens(),  # 🔥 front kutayotgan format
            status=status.HTTP_200_OK
        )


@extend_schema(tags=['Users'])
class SendCodeAPIView(APIView):
    serializer_class = SendSmsCodeSerializer
    authentication_classes = ()

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = random_code()
        phone = serializer.validated_data['phone']
        # send_sms_code(phone, code)
        result = send_sms_code(phone, code)

        if not result["allowed"]:
            return Response(
                {
                    "message": f"{result['remain_seconds']} sekunddan so'ng yubora olasiz."
                },
                status=429
            )
        return Response({"message": "send sms code"})


@extend_schema(tags=['Users'])
class ChangePasswordAPIView(APIView):
    serializer_class = ChangePasswordSerializer
    authentication_classes = ()

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data['phone']
        code = serializer.validated_data['code']

        if not check_sms_code(phone, code):
            return Response({"message": "Invalid code"}, status=400)

        serializer.save()
        return Response(serializer.get_data)


class ExecutorListAPIView(ListCreateAPIView):
    serializer_class = ExecutorListModelSerializer
    permission_classes = [IsOperator]

    def get_queryset(self):
        return User.objects.filter(role="EXECUTOR")


class ExecutorRetrieveAPIView(RetrieveAPIView):
    serializer_class = ExecutorListModelSerializer
    permission_classes = [IsOperator]

    def get_queryset(self):
        return User.objects.filter(role="EXECUTOR")
