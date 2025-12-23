from rest_framework.generics import ListCreateAPIView

from applications.models import Application, Region, District
from applications.serializers import ApplicationModelSerializer, RegionModelSerializer, DistrictModelSerializer


# Create your views here.


class ApplicationsListCreateAPIView(ListCreateAPIView):
    queryset = Application.objects.all().order_by('-created_at')
    serializer_class = ApplicationModelSerializer


class RegionsListCreateAPIView(ListCreateAPIView):
    queryset = Region.objects.all()
    serializer_class = RegionModelSerializer

class DistrictsListCreateAPIView(ListCreateAPIView):
    queryset = District.objects.all()
    serializer_class = DistrictModelSerializer
