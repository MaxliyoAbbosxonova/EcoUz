from django.urls import path

from applications.views import ApplicationsListCreateAPIView, RegionsListCreateAPIView, DistrictsListCreateAPIView

urlpatterns = [
    path('applications/', ApplicationsListCreateAPIView.as_view(), name='applications-list'),
    path('regions/', RegionsListCreateAPIView.as_view(), name='applications-list'),
    path('districts/', DistrictsListCreateAPIView.as_view(), name='applications-list'),

]
