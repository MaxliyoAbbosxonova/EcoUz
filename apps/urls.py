
from django.urls import path,include

urlpatterns = [
    path('', include('applications.urls')),
    path('users/', include('users.urls')),
]