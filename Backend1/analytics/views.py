from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.mail import send_mail
from django.conf import settings
from Accounts.models import User, FarmerProfile, CompanyProfile
from contracts.models import Contract
from disputes.models import Dispute
from monitoring.models import CropUpdate, Inspection
from payments.models import FundingTransaction
from .permissions import IsAdmin

from email_service.email_service import Verification_email
class AdminSummaryView(APIView):
    permission_classes = [IsAdmin]
    def get(self, request):
        pending_farmers = FarmerProfile.objects.filter(verification_status="PENDING").count()
        pending_companies = CompanyProfile.objects.filter(verification_status="PENDING").count()
        return Response({
            "users": User.objects.count(),
            "farmers": User.objects.filter(role="FARMER").count(),
            "companies": User.objects.filter(role="COMPANY").count(),
            "contracts": Contract.objects.count(),
            "active_contracts": Contract.objects.filter(status="ACTIVE").count(),
            "negotiating_contracts": Contract.objects.filter(status="NEGOTIATING").count(),
            "completed_contracts": Contract.objects.filter(status="COMPLETED").count(),
            "payments": FundingTransaction.objects.count(),
            "disputes": Dispute.objects.count(),
            "open_disputes": Dispute.objects.exclude(status="RESOLVED").count(),
            "inspections": Inspection.objects.count(),
            "crop_updates": CropUpdate.objects.count(),
            "pending_verifications": pending_farmers + pending_companies,
            "pending_farmers": pending_farmers,
            "pending_companies": pending_companies,
        })

class UserListView(APIView):
    permission_classes = [IsAdmin]

    def _user_data(self, user, request):
        profile = None
        if user.role == "FARMER":
            profile = getattr(user, "farmer_profile", None)
        elif user.role == "COMPANY":
            profile = getattr(user, "company_profile", None)

        verification_status = profile.verification_status if profile else ("VERIFIED" if user.is_verified else "PENDING")
        documents = [
            {
                "name": document.file.name.rsplit("/", 1)[-1],
                "url": request.build_absolute_uri(document.file.url),
                "uploaded_at": document.uploaded_at,
            }
            for document in user.verification_documents.all()
        ]
        profile_data = {}
        if profile:
            profile_data = {
                field.name: getattr(profile, field.name)
                for field in profile._meta.fields
                if field.name not in {"id", "user", "verification_status", "created_at"}
            }
        return {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "role": user.role,
            "display_name": (profile.farm_name if user.role == "FARMER" and profile else profile.company_name if user.role == "COMPANY" and profile else user.get_full_name() or user.email),
            "verification_status": verification_status,
            "is_verified": user.is_verified,
            "is_active": user.is_active,
            "date_joined": user.date_joined,
            "profile": profile_data,
            "documents": documents,
        }

    def get(self, request):
        queryset = User.objects.select_related("farmer_profile", "company_profile").prefetch_related("verification_documents").exclude(role="ADMIN").order_by("-date_joined")
        return Response([self._user_data(user, request) for user in queryset])

    def post(self, request):
        user = User.objects.select_related("farmer_profile", "company_profile").filter(pk=request.data.get("user_id")).first()
        decision = request.data.get("decision")
        if not user or decision not in {"verify", "reject"}:
            return Response({"detail": "A valid user_id and decision are required."}, status=400)

        verified = decision == "verify"
        user.is_verified = verified
        user.is_active = verified
        user.save(update_fields=["is_verified", "is_active"])
        profile = getattr(user, "farmer_profile", None) or getattr(user, "company_profile", None)
        if profile:
            profile.verification_status = "VERIFIED" if verified else "REJECTED"
            profile.save(update_fields=["verification_status"])

            # Send verification email
        Verification_email(user.email, user.username, "VERIFIED" if verified else "REJECTED")

        send_mail(
            f"AgriContract account {'verified' if verified else 'not verified'}",
            f"Hello {user.get_full_name() or user.email},\n\nYour AgriContract account has been {'verified' if verified else 'not verified'} by the administrator.",
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        return Response(self._user_data(user, request))

class AdminContractsView(APIView):
    permission_classes = [IsAdmin]
    def get(self, request):
        return Response(list(Contract.objects.values("id", "status", "agreed_quantity", "agreed_price", "created_at", "farmer__farm_name", "company__company_name", "crop__name").order_by("-created_at")))

class AdminPaymentsView(APIView):
    permission_classes = [IsAdmin]
    def get(self, request):
        return Response(list(
            FundingTransaction.objects.select_related(
                "account__contract__crop",
                "account__contract__farmer",
                "account__contract__company",
            ).values(
                "id", "amount", "transaction_type", "status", "created_at",
                "account__contract_id",
                "account__contract__crop__name",
                "account__contract__farmer__farm_name",
                "account__contract__company__company_name",
            ).order_by("-created_at")
        ))

class AdminDisputesView(APIView):
    permission_classes = [IsAdmin]
    def get(self, request):
        return Response(list(
            Dispute.objects.select_related("contract__crop", "contract__farmer", "contract__company").values(
                "id", "contract_id", "title", "description", "status", "priority", "created_at",
                "contract__crop__name", "contract__farmer__farm_name", "contract__company__company_name",
            ).order_by("-created_at")
        ))


from django.utils import timezone
from disputes.models import Dispute
 
 
class AdminDisputeDetailView(APIView):
    permission_classes = [IsAdmin]
 
    def patch(self, request, pk):
        dispute = Dispute.objects.filter(pk=pk).first()
        if not dispute:
            return Response({"detail": "Dispute not found."}, status=404)
 
        next_status = request.data.get("status")
        valid_statuses = dict(Dispute.STATUS_CHOICES)
        if next_status not in valid_statuses:
            return Response({"detail": "A valid status is required."}, status=400)
 
        dispute.status = next_status
        if next_status in ("RESOLVED", "REJECTED"):
            dispute.resolved_at = timezone.now()
            outcome = request.data.get("outcome")
            if outcome:
                dispute.outcome = outcome
        dispute.save(update_fields=["status", "resolved_at", "outcome"])
 
        return Response({
            "id": dispute.id,
            "status": dispute.status,
            "resolved_at": dispute.resolved_at,
            "outcome": dispute.outcome,
        })
 