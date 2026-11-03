from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django.utils import timezone
from .models import Contract
from .serializers import ContractSerializer
from django.db.models import Q
from django.http import HttpResponse
from django.utils.timezone import localtime
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

class IsContractParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == 'FARMER':
            return hasattr(user, 'farmer_profile') and obj.farmer == user.farmer_profile
        elif user.role == 'COMPANY':
            return hasattr(user, 'company_profile') and obj.company == user.company_profile
        return False


class IsContractParticipantOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        return IsContractParticipant().has_object_permission(request, view, obj)

class ContractViewSet(viewsets.ModelViewSet):
    serializer_class = ContractSerializer
    permission_classes = [permissions.IsAuthenticated, IsContractParticipantOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Contract.objects.all().order_by('-created_at')
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
        contract = self.get_object()
        if request.user.role != 'COMPANY' or contract.status != 'DRAFT':
            raise PermissionDenied("Only an unsent draft request can be deleted.")
        contract.status = 'CANCELLED'
        contract.save(update_fields=['status', 'updated_at'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'], url_path='pdf')
    def pdf(self, request, pk=None):
        contract = self.get_object()
        return build_contract_pdf(contract)

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
        elif contract.farmer_approved_at and contract.company_approved_at and contract.agreed_price:
            contract.status = 'AGREED'
        contract.save()
        from communications.models import Notification
        other_user = contract.company.user if request.user.role == 'FARMER' else contract.farmer.user
        Notification.objects.create(user=other_user, title=f'Contract request #{contract.id} accepted', message='The request was accepted. You can now negotiate price and quantity.', notification_type='CONTRACT')
        return Response(self.get_serializer(contract).data)

    @action(detail=True, methods=['post'])
    def sign(self, request, pk=None):
        contract = self.get_object()
        if contract.status != 'AGREED':
            return Response({'detail': 'Only an agreed contract can be signed.'}, status=status.HTTP_400_BAD_REQUEST)
        if not contract.agreed_price or not contract.farmer_approved_at or not contract.company_approved_at:
            return Response({'detail': 'Both parties must approve an agreed price before signing.'}, status=status.HTTP_400_BAD_REQUEST)
        if contract.is_fully_signed:
            return Response({'detail': 'This contract is already fully signed.'}, status=status.HTTP_400_BAD_REQUEST)
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
    def deliver(self, request, pk=None):
        contract = self.get_object()
        if request.user.role != 'FARMER':
            return Response({'detail': 'Only the farmer can mark the crop as delivered.'}, status=status.HTTP_403_FORBIDDEN)
        if contract.status != 'ACTIVE' or not contract.is_fully_signed:
            return Response({'detail': 'Both parties must sign an active contract before delivery.'}, status=status.HTTP_400_BAD_REQUEST)
        contract.status = 'COMPLETED'
        contract.delivery_at = timezone.now()
        contract.save(update_fields=['status', 'delivery_at', 'updated_at'])
        from communications.models import Notification
        Notification.objects.create(
            user=contract.company.user,
            title=f"Crop delivered for contract #{contract.id}",
            message=f"{contract.crop.name} has been delivered. Please confirm final delivery and release the remaining payment.",
            notification_type='CONTRACT',
        )
        return Response(self.get_serializer(contract).data)


def build_contract_pdf(contract):
    """Render the current negotiated contract without persisting a document."""
    buffer = BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'ContractTitle',
        parent=styles['Title'],
        textColor=colors.HexColor('#12304A'),
        spaceAfter=6,
    )
    heading_style = ParagraphStyle(
        'ContractHeading',
        parent=styles['Heading2'],
        textColor=colors.HexColor('#12304A'),
        spaceBefore=12,
        spaceAfter=6,
    )
    body_style = ParagraphStyle('ContractBody', parent=styles['BodyText'], leading=14)

    def timestamp(value):
        return localtime(value).strftime('%d %b %Y, %I:%M %p') if value else 'Pending'

    def value(value):
        return str(value) if value not in (None, '') else 'Not specified'

    farmer = contract.farmer
    buyer = contract.company
    crop = contract.crop
    story = [
        Paragraph('AGRISURE DIGITAL CROP CONTRACT', title_style),
        Paragraph(f'Contract No. {contract.id}', body_style),
        Paragraph(
            'This agreement records the negotiated terms between the farmer and buyer shown below.',
            body_style,
        ),
        Paragraph('Parties', heading_style),
        Table([
            ['Farmer', value(farmer.user.get_full_name() or farmer.user.email)],
            ['Farm / address', f'{value(farmer.farm_name)} / {value(farmer.address)}, {value(farmer.district)}, {value(farmer.state)}'],
            ['Farmer email', value(farmer.user.email)],
            ['Buyer', value(buyer.company_name)],
            ['Buyer contact', f'{value(buyer.contact_person)} / {value(buyer.company_address)}'],
            ['Buyer email', value(buyer.user.email)],
        ], colWidths=[42 * mm, 130 * mm]),
        Paragraph('Crop and negotiated commercial terms', heading_style),
        Table([
            ['Crop', f'{value(crop.name)} ({value(crop.variety)})'],
            ['Farming details', f'{value(crop.farming_method)}, {value(crop.quality_grade)}, {value(crop.irrigation_type)}'],
            ['Cultivation area', f'{value(crop.cultivation_area)} acres'],
            ['Quantity', f'{value(contract.agreed_quantity)} quintals'],
            ['Price', f'INR {value(contract.agreed_price)} per quintal'],
            ['Total contract value', f'INR {contract.total_amount}'],
            ['Advance (20%)', f'INR {contract.advance_amount}'],
            ['Delivery location', value(contract.delivery_location or crop.delivery_location)],
            ['Expected harvest', value(crop.expected_harvest_date)],
            ['Payment terms', value(contract.payment_terms)],
        ], colWidths=[52 * mm, 120 * mm]),
        Paragraph('Terms and conditions', heading_style),
        Paragraph(value(contract.terms_conditions), body_style),
        Paragraph('Agreement timeline', heading_style),
        Table([
            ['Contract created', timestamp(contract.created_at)],
            ['Farmer approved', timestamp(contract.farmer_approved_at)],
            ['Buyer approved', timestamp(contract.company_approved_at)],
            ['Price negotiated / offer accepted', timestamp(contract.price_agreed_at)],
            ['Farmer signed', timestamp(contract.farmer_signed_at)],
            ['Buyer signed', timestamp(contract.company_signed_at)],
            ['Crop delivered', timestamp(contract.delivery_at)],
        ], colWidths=[70 * mm, 102 * mm]),
        Spacer(1, 8),
        Paragraph(
            f'Status: {contract.get_status_display()} | Generated: {timestamp(__import__("django.utils.timezone", fromlist=["now"]).now())}',
            body_style,
        ),
    ]
    for table in (story[4], story[6], story[10]):
        table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#CBD5E1')),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F1F5F9')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ]))
    document.build(story)
    response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="agrisure-contract-{contract.id}.pdf"'
    return response
