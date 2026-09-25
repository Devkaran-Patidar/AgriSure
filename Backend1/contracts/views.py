from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
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

    def update(self, request, *args, **kwargs):
        raise PermissionDenied("Contract details cannot be edited after creation. Use the approval, signature, and delivery actions instead.")

    def partial_update(self, request, *args, **kwargs):
        raise PermissionDenied("Contract details cannot be edited after creation. Use the approval, signature, and delivery actions instead.")

    def destroy(self, request, *args, **kwargs):
        raise PermissionDenied("Contracts cannot be deleted once created. Use the reject action for draft requests.")

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        contract = self.get_object()
        if contract.status == 'DRAFT' and request.user.role != 'FARMER':
            return Response({'detail': 'Only the farmer can accept a new contract request.'}, status=status.HTTP_400_BAD_REQUEST)
        if contract.status not in ('DRAFT', 'NEGOTIATING', 'AGREED'):
            return Response({'detail': 'Only a pending request can be accepted.'}, status=status.HTTP_400_BAD_REQUEST)
        if request.user.role == 'FARMER':
            contract.farmer_approved_at = timezone.now()
        elif request.user.role == 'COMPANY':
            contract.company_approved_at = timezone.now()
        else:
            return Response({'detail': 'Only contract participants can approve.'}, status=status.HTTP_403_FORBIDDEN)
        if contract.status == 'DRAFT':
            contract.status = 'NEGOTIATING'
        elif contract.farmer_approved_at and contract.company_approved_at:
            contract.status = 'AGREED'
        contract.save()
        from communications.models import Notification
        other_user = contract.company.user if request.user.role == 'FARMER' else contract.farmer.user
        Notification.objects.create(user=other_user, title=f'Contract request #{contract.id} accepted', message='The request was accepted. You can now negotiate price and quantity.', notification_type='CONTRACT')
        return Response(self.get_serializer(contract).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        contract = self.get_object()
        if contract.status != 'DRAFT':
            return Response({'detail': 'Only a pending request can be rejected.'}, status=status.HTTP_400_BAD_REQUEST)
        contract.status = 'CANCELLED'
        contract.save(update_fields=['status', 'updated_at'])
        from communications.models import Notification
        other_user = contract.company.user if request.user.role == 'FARMER' else contract.farmer.user
        Notification.objects.create(user=other_user, title=f'Contract request #{contract.id} declined', message='The contract request was declined.', notification_type='CONTRACT')
        return Response(self.get_serializer(contract).data)

    @action(detail=True, methods=['post'])
    def sign(self, request, pk=None):
        contract = self.get_object()
        if contract.status not in ('AGREED', 'NEGOTIATING'):
            return Response({'detail': 'Only agreed or negotiating contracts can be signed.'}, status=status.HTTP_400_BAD_REQUEST)
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

    @action(detail=True, methods=['post'])
    def deliver(self, request, pk=None):
        contract = self.get_object()
        if request.user.role != 'FARMER':
            return Response({'detail': 'Only the farmer can mark the crop as delivered.'}, status=status.HTTP_403_FORBIDDEN)
        if contract.status not in ('ACTIVE', 'AGREED'):
            return Response({'detail': 'Only an active or agreed contract can be marked delivered.'}, status=status.HTTP_400_BAD_REQUEST)

        contract.status = 'COMPLETED'
        contract.save(update_fields=['status', 'updated_at'])

        from communications.models import Notification
        Notification.objects.create(
            user=contract.company.user,
            title=f"Crop delivered for contract #{contract.id}",
            message=f"{contract.crop.name} has been delivered. Please confirm final delivery and release the remaining payment.",
            notification_type='CONTRACT',
        )

        return Response(self.get_serializer(contract).data)
