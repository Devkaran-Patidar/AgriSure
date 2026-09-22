from django.urls import path
from .views import CropUpdateListCreateView, InspectionListCreateView

urlpatterns = [
    path("updates/", CropUpdateListCreateView.as_view(), name="crop-updates"),
    path("inspections/", InspectionListCreateView.as_view(), name="inspections"),
]
