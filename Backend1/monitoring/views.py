from django.db.models import Q
from rest_framework import generics, permissions, serializers
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from contracts.models import Contract
from farmer.models import Crop
from .models import CropUpdate, Inspection
from .serializers import CropUpdateSerializer, InspectionSerializer


def visible_contracts(user):
    if user.role == "FARMER" and hasattr(user, "farmer_profile"):
        return Contract.objects.filter(farmer=user.farmer_profile)
    if user.role == "COMPANY" and hasattr(user, "company_profile"):
        return Contract.objects.filter(company=user.company_profile)
    return Contract.objects.none()


class CropUpdateListCreateView(generics.ListCreateAPIView):
    serializer_class = CropUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        return CropUpdate.objects.filter(
            Q(crop__farmer__user=self.request.user) | Q(contract__in=visible_contracts(self.request.user))
        ).select_related("crop", "contract")

    def perform_create(self, serializer):
        if self.request.user.role != "FARMER" or not hasattr(self.request.user, "farmer_profile"):
            raise PermissionDenied("Only farmers can submit crop updates.")
        crop_id = self.request.data.get("crop")
        try:
            crop = Crop.objects.get(id=crop_id, farmer=self.request.user.farmer_profile)
        except Crop.DoesNotExist:
            raise serializers.ValidationError({"crop": "Crop not found for this farmer."})
        contract = crop.contracts.filter(farmer=self.request.user.farmer_profile).first()
        update = serializer.save(crop=crop, contract=contract)
        if contract:
            from communications.models import Notification
            Notification.objects.create(user=contract.company.user, title=f"Crop update for contract #{contract.id}", message=f"{crop.name} progress is now {update.completion_percent}% ({update.stage}).", notification_type="MONITORING")


class InspectionListCreateView(generics.ListCreateAPIView):
    serializer_class = InspectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Inspection.objects.filter(contract__in=visible_contracts(self.request.user)).select_related("contract__crop")

    def perform_create(self, serializer):
        contract_id = self.request.data.get("contract")
        if not visible_contracts(self.request.user).filter(id=contract_id).exists():
            raise permissions.PermissionDenied("You are not a participant in this contract.")
        serializer.save()
