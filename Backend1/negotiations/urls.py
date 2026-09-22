from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NegotiationOfferViewSet

router = DefaultRouter()
router.register(r'', NegotiationOfferViewSet, basename='negotiation')

urlpatterns = [
    path('', include(router.urls)),
]
