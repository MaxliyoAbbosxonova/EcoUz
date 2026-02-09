from django.urls import path

from applications.views import ApplicationsListCreateAPIView, RegionsListCreateAPIView, DistrictsListCreateAPIView, \
    OperatorApplicationListAPIView, OperatorApplicationDetailAPIView, ExecutorApplicationListAPIView, \
    HighlightListCreateAPIView, ResultRetrieveUpdateDestroyAPIView, ResultListCreateAPIView,\
    ExecutorApplicationDetailAPIView

urlpatterns = [
    path('applications/', ApplicationsListCreateAPIView.as_view(), name='applications-list'),

    path('regions/', RegionsListCreateAPIView.as_view(), name='regions-list'),
    path('districts/', DistrictsListCreateAPIView.as_view(), name='districts-list'),

    path('operator/applications/', OperatorApplicationListAPIView.as_view(), name='operator-applications-list'),
    path('operator/applications/<int:pk>/', OperatorApplicationDetailAPIView.as_view(),
         name='operator-application-detail'),

    path('executor/applications/', ExecutorApplicationListAPIView.as_view(), name='executor-applications-list'),
    path('executor/applications/<int:pk>', ExecutorApplicationDetailAPIView.as_view(),name='executor-application-detail'),

    path('results/', ResultListCreateAPIView.as_view(), name='results-list'),
    path('results/<int:pk>', ResultRetrieveUpdateDestroyAPIView.as_view(), name='results-list'),
    # path('result-images/', ImageListCreateAPIView.as_view(), name='images-list'),
    path('highlights/', HighlightListCreateAPIView.as_view(), name='highlights-list'),
]
