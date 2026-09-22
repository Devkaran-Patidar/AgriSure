from rest_framework import viewsets, permissions
from .models import Crop
from .serializers import CropSerializer

class IsFarmerOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.farmer.user == request.user

class CropViewSet(viewsets.ModelViewSet):
    serializer_class = CropSerializer
    permission_classes = [permissions.IsAuthenticated, IsFarmerOwner]

    def get_queryset(self):
        # Only return crops for the currently logged-in farmer
        if hasattr(self.request.user, 'farmer_profile'):
            return Crop.objects.filter(farmer=self.request.user.farmer_profile)
        return Crop.objects.none()
