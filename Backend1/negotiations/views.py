from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import NegotiationOffer
from .serializers import NegotiationOfferSerializer
from contracts.models import Contract
from communications.models import Notification

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
        
        # Cannot accept own offer
        if offer.offered_by == user:
            return Response({"detail": "You cannot accept your own offer."}, status=status.HTTP_400_BAD_REQUEST)

        offer.status = 'ACCEPTED'
        offer.save()

        contract = offer.contract
        contract.agreed_price = offer.offered_price
        contract.status = 'AGREED'
        contract.save()

        Notification.objects.bulk_create([
            Notification(user=contract.farmer.user, title=f"Contract #{contract.id} agreed", message="Your negotiated price was accepted. Review and sign the contract.", notification_type="CONTRACT"),
            Notification(user=contract.company.user, title=f"Contract #{contract.id} agreed", message="The offer is accepted. Review and sign the contract.", notification_type="CONTRACT"),
        ])

        return Response({"detail": "Offer accepted."})
