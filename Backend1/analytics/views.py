from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from Accounts.models import User, FarmerProfile, CompanyProfile
from contracts.models import Contract
from disputes.models import Dispute
from monitoring.models import CropUpdate, Inspection
from payments.models import FundingTransaction
from .permissions import IsAdmin

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
    def get(self, request):
        users = []
        queryset = User.objects.select_related("farmer_profile", "company_profile").order_by("-date_joined")
        for user in queryset:
            display_name = user.get_full_name() or user.email
            verification_status = "N/A"
            if user.role == "FARMER" and hasattr(user, "farmer_profile"):
                display_name = user.farmer_profile.farm_name
                verification_status = user.farmer_profile.verification_status
            elif user.role == "COMPANY" and hasattr(user, "company_profile"):
                display_name = user.company_profile.company_name
                verification_status = user.company_profile.verification_status
            users.append({
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "display_name": display_name,
                "verification_status": verification_status,
                "is_active": user.is_active,
                "date_joined": user.date_joined,
            })
        return Response(users)

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
