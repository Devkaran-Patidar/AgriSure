from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import NegotiationOffer
from .serializers import NegotiationOfferSerializer
from contracts.models import Contract
from communications.models import Notification
from payments.views import get_or_create_account

class NegotiationOfferViewSet(viewsets.ModelViewSet):
    serializer_class = NegotiationOfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'FARMER' and hasattr(user, 'farmer_profile'):
            queryset = NegotiationOffer.objects.filter(contract__farmer=user.farmer_profile)
        elif user.role == 'COMPANY' and hasattr(user, 'company_profile'):
            queryset = NegotiationOffer.objects.filter(contract__company=user.company_profile)
        else:
            return NegotiationOffer.objects.none()

        contract_id = self.request.query_params.get('contract')
        if contract_id:
            queryset = queryset.filter(contract_id=contract_id)
        return queryset

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        offer = self.get_object()
        user = request.user

        if offer.offered_by == user:
            return Response({"detail": "You cannot accept your own offer."}, status=status.HTTP_400_BAD_REQUEST)

        contract = offer.contract
        if contract.status != 'NEGOTIATING' or contract.is_fully_signed:
            return Response({"detail": "This contract is no longer open for negotiation."}, status=status.HTTP_400_BAD_REQUEST)
        if not contract.farmer_approved_at or not contract.company_approved_at:
            return Response({"detail": "Both parties must approve the request before an offer can be accepted."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            offer = NegotiationOffer.objects.select_for_update().select_related('contract').get(pk=offer.pk)
            if offer.status != 'PENDING':
                return Response({"detail": "This offer is no longer pending."}, status=status.HTTP_400_BAD_REQUEST)
            offer.status = 'ACCEPTED'
            offer.save(update_fields=['status'])
            contract = offer.contract
            contract.agreed_price = offer.offered_price
            contract.status = 'AGREED'
            contract.save(update_fields=['agreed_price', 'status', 'updated_at'])
            NegotiationOffer.objects.filter(contract=contract, status='PENDING').exclude(pk=offer.pk).update(status='REJECTED')
        get_or_create_account(contract)

        Notification.objects.bulk_create([
            Notification(user=contract.farmer.user, title=f"Contract #{contract.id} agreed", message="Your negotiated price was accepted. Review and sign the contract.", notification_type="CONTRACT"),
            Notification(user=contract.company.user, title=f"Contract #{contract.id} agreed", message="The offer is accepted. Review and sign the contract.", notification_type="CONTRACT"),
        ])

        return Response({"detail": "Offer accepted."})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        offer = self.get_object()
        if offer.status != 'PENDING':
            return Response({"detail": "Only a pending offer can be rejected."}, status=status.HTTP_400_BAD_REQUEST)
        if offer.offered_by_id == request.user.id:
            return Response({"detail": "You cannot reject your own offer."}, status=status.HTTP_400_BAD_REQUEST)
        offer.status = 'REJECTED'
        offer.save(update_fields=['status'])
        return Response({"detail": "Offer rejected."})

    def destroy(self, request, *args, **kwargs):
        offer = self.get_object()
        if offer.offered_by_id != request.user.id or offer.status != 'PENDING':
            return Response({"detail": "Only your pending offer can be deleted."}, status=status.HTTP_403_FORBIDDEN)
        offer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
