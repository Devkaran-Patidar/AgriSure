from rest_framework import viewsets, permissions

from .models import Crop
from .serializers import CropSerializer


class IsFarmerOwner(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        return obj.farmer.user == request.user


class CropViewSet(viewsets.ModelViewSet):

    serializer_class = CropSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):

        if hasattr(self.request.user, "farmer_profile"):
            return Crop.objects.filter(
                farmer=self.request.user.farmer_profile
            ).order_by("-created_at")

        return Crop.objects.none()

    def perform_create(self, serializer):

        if not hasattr(self.request.user, "farmer_profile"):
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "Only farmers can create crop listings."
            )

        serializer.save(
            farmer=self.request.user.farmer_profile
        )

    def _locked(self, obj):
        return obj.contracts.exclude(status="CANCELLED").exists()

    def update(self, request, *args, **kwargs):
        if self._locked(self.get_object()):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("This crop is locked while a contract request or agreement is active.")
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if self._locked(self.get_object()):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("This crop is locked while a contract request or agreement is active.")
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if self._locked(self.get_object()):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("This crop cannot be deleted while a contract request or agreement is active.")
        return super().destroy(request, *args, **kwargs)

    def get_permissions(self):

        if self.action in ["update", "partial_update", "destroy"]:
            return [
                permissions.IsAuthenticated(),
                IsFarmerOwner(),
            ]

        return [
            permissions.IsAuthenticated()
        ]