from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Contract
from .serializers import ContractSerializer
from django.db.models import Q

class IsContractParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == 'FARMER':
            return hasattr(user, 'farmer_profile') and obj.farmer == user.farmer_profile
        elif user.role == 'COMPANY':
            return hasattr(user, 'company_profile') and obj.company == user.company_profile
        return False

class ContractViewSet(viewsets.ModelViewSet):
    serializer_class = ContractSerializer
    permission_classes = [permissions.IsAuthenticated, IsContractParticipant]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'FARMER' and hasattr(user, 'farmer_profile'):
            return Contract.objects.filter(farmer=user.farmer_profile).order_by('-created_at')
        elif user.role == 'COMPANY' and hasattr(user, 'company_profile'):
            return Contract.objects.filter(company=user.company_profile).order_by('-created_at')
        return Contract.objects.none()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        contract = self.get_object()
        if request.user.role == 'FARMER':
            contract.farmer_approved_at = timezone.now()
        elif request.user.role == 'COMPANY':
            contract.company_approved_at = timezone.now()
        else:
            return Response({'detail': 'Only contract participants can approve.'}, status=status.HTTP_403_FORBIDDEN)
        contract.status = 'AGREED'
        contract.save()
        return Response(self.get_serializer(contract).data)

    @action(detail=True, methods=['post'])
    def sign(self, request, pk=None):
        contract = self.get_object()
        if request.user.role == 'FARMER':
            contract.farmer_signed_at = timezone.now()
        elif request.user.role == 'COMPANY':
            contract.company_signed_at = timezone.now()
        else:
            return Response({'detail': 'Only contract participants can sign.'}, status=status.HTTP_403_FORBIDDEN)
        if contract.farmer_signed_at and contract.company_signed_at:
            contract.status = 'ACTIVE'
        contract.save()
        return Response(self.get_serializer(contract).data)
