from applications.models import Application, District, Highlight, Region, Result
from applications.permissions import IsExecutor, IsOperator
from applications.serializers import (
    ApplicationModelSerializer,
    DistrictModelSerializer,
    HighlightModelSerializer,
    OperatorAssignModelSerializer,
    RegionModelSerializer,
    ResultModelSerializer,
)
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    RetrieveUpdateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


@extend_schema(tags=['Operator Assignment'])
# Create your views here.
class OperatorApplicationListAPIView(ListAPIView):
    serializer_class = ApplicationModelSerializer
    permission_classes = [IsOperator]

    def get_queryset(self):
        return Application.objects.filter(status='NEW').order_by('created_at')


@extend_schema(tags=['Operator Assignment'])
class OperatorApplicationDetailAPIView(RetrieveUpdateAPIView):
    serializer_class = OperatorAssignModelSerializer
    permission_classes = [IsOperator]
    queryset = Application.objects.all()


@extend_schema(tags=['Executor Assignment'])
class ExecutorApplicationListAPIView(ListAPIView):
    serializer_class = ApplicationModelSerializer
    permission_classes = [IsAuthenticated, IsExecutor]

    def get_queryset(self):
        return Application.objects.filter(assigned_to=self.request.user,
                                          status__in=['ASSIGNED', 'ACCEPTED', 'DONE']).order_by('created_at')


@extend_schema(tags=['Executor Assignment'])
class ExecutorApplicationDetailAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = ApplicationModelSerializer
    permission_classes = [IsAuthenticated, IsExecutor]

    def get_queryset(self):
        return Application.objects.filter(assigned_to=self.request.user,
                                          status__in=['ASSIGNED', 'ACCEPTED', 'DONE']).order_by('created_at')


@extend_schema(tags=['Result Assignment'])
class ResultListCreateAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = ResultModelSerializer

    def get(self, request, *args, **kwargs):
        res = Result.objects.all()
        serializer = self.serializer_class(res, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        application = serializer.validated_data['application']
        application.status = Application.Status.DONE
        application.save(update_fields=['status'])
        return Response(ResultModelSerializer(result).data, status=201)

    def queryset(self):
        user = self.request.user
        return Result.objects.filter(application__assigned_to=user).order_by('created_at')


@extend_schema(tags=['Result Assignment'])
class ResultRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = ResultModelSerializer
    permission_classes = [IsAuthenticated, IsExecutor]

    def get_queryset(self):
        user = self.request.user
        return Result.objects.filter(application__assigned_to=user).order_by('created_at')


class ApplicationsListCreateAPIView(ListCreateAPIView):
    queryset = Application.objects.all().order_by('created_at')
    serializer_class = ApplicationModelSerializer
    parser_classes = (MultiPartParser, FormParser)


@extend_schema(tags=['Secondary'])
class RegionsListCreateAPIView(ListCreateAPIView):
    queryset = Region.objects.all()
    serializer_class = RegionModelSerializer


@extend_schema(tags=['Secondary'])
class DistrictsListCreateAPIView(ListCreateAPIView):
    serializer_class = DistrictModelSerializer

    def get_queryset(self):
        region_id = self.request.query_params.get("region_id")
        if region_id is not None:
            return District.objects.filter(region_id=region_id)
        return District.objects.all().order_by('created_at')


@extend_schema(tags=['Secondary'])
class HighlightListCreateAPIView(ListCreateAPIView):
    queryset = Highlight.objects.all()
    serializer_class = HighlightModelSerializer
    permission_classes = [IsAdminUser]
