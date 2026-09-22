from django.utils import timezone
from rest_framework import generics, permissions
from .models import Dispute, DisputeEvidence
from .serializers import DisputeSerializer, DisputeEvidenceSerializer
from contracts.models import Contract

def participant_disputes(user):
    if user.role == "ADMIN": return Dispute.objects.all()
    contracts = Contract.objects.filter(farmer__user=user) | Contract.objects.filter(company__user=user)
    return Dispute.objects.filter(contract__in=contracts)

class DisputeListCreateView(generics.ListCreateAPIView):
    serializer_class = DisputeSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return participant_disputes(self.request.user).order_by("-created_at")
    def perform_create(self, serializer):
        contract_id = self.request.data.get("contract")
        allowed = Contract.objects.filter(id=contract_id).filter(farmer__user=self.request.user) | Contract.objects.filter(id=contract_id).filter(company__user=self.request.user)
        if not allowed.exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You are not a participant in this contract.")
        serializer.save(raised_by=self.request.user)

class EvidenceListCreateView(generics.ListCreateAPIView):
    serializer_class = DisputeEvidenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return DisputeEvidence.objects.filter(dispute__in=participant_disputes(self.request.user))
    def perform_create(self, serializer):
        if not participant_disputes(self.request.user).filter(id=self.request.data.get("dispute")).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You cannot add evidence to this dispute.")
        serializer.save(uploaded_by=self.request.user)
