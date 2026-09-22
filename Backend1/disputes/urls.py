from django.urls import path
from .views import DisputeListCreateView, EvidenceListCreateView
urlpatterns = [path("", DisputeListCreateView.as_view()), path("evidence/", EvidenceListCreateView.as_view())]
