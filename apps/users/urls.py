from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from users.views import (UserListCreateApiView, SendCodeAPIView, ChangePasswordAPIView, LoginApiView,
                         ExecutorListAPIView, ExecutorRetrieveAPIView)

urlpatterns = [
    path('users/', UserListCreateApiView.as_view(), name='user-list'),
    path('login/',LoginApiView.as_view(), name='login'),
    path('send_sms/',SendCodeAPIView.as_view(), name='send-code'),
    path('reset_password/',ChangePasswordAPIView.as_view(), name='reset-password'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('executors/',ExecutorListAPIView.as_view(), name='executor-list'),
    path('executors/<int:pk>',ExecutorRetrieveAPIView.as_view(), name='executor-list'),

]

