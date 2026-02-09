from django.urls import include, path

urlpatterns = [
    path('', include('applications.urls')),
    path('users/', include('users.urls')), ]
