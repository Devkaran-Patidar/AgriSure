from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyCropViewSet

router = DefaultRouter()
router.register(r'crops', CompanyCropViewSet, basename='company-crop')

urlpatterns = [
    path('', include(router.urls)),
]
