from rest_framework import viewsets, permissions
from farmer.models import Crop
from farmer.serializers import CropSerializer
from contracts.models import Contract

class IsCompanyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'COMPANY'

class CompanyCropViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Allow companies to browse available crops.
    """
    serializer_class = CropSerializer
    permission_classes = [IsCompanyPermission]
    queryset = Crop.objects.exclude(
        contracts__status__in=('DRAFT', 'NEGOTIATING', 'AGREED', 'ACTIVE', 'COMPLETED')
    ).order_by('-created_at')
