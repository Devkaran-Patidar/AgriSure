from django.db import transaction
from django.utils import timezone
from decimal import Decimal, InvalidOperation
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from contracts.models import Contract
from .models import EscrowAccount, FundingTransaction, Milestone
from .serializers import EscrowAccountSerializer


def participant_contracts(user):
    if user.role == "FARMER" and hasattr(user, "farmer_profile"):
        return Contract.objects.filter(farmer=user.farmer_profile)
    if user.role == "COMPANY" and hasattr(user, "company_profile"):
        return Contract.objects.filter(company=user.company_profile)
    return Contract.objects.none()


def get_or_create_account(contract):
    account, _ = EscrowAccount.objects.get_or_create(contract=contract)
    total = (contract.agreed_price or 0) * contract.agreed_quantity
    if account.total_amount != total:
        account.total_amount = total
        account.save(update_fields=['total_amount', 'updated_at'])
    if not contract.payment_milestones.filter(sequence=1).exists():
        Milestone.objects.create(
            contract=contract,
            name="Initial 20% release",
            amount=total * Decimal("0.20"),
            sequence=1,
        )
    if not contract.payment_milestones.filter(sequence=2).exists():
        Milestone.objects.create(contract=contract, name="Final delivery release", amount=total * Decimal("0.80"), sequence=2)
    else:
        contract.payment_milestones.filter(sequence=1, status="PENDING").update(amount=total * Decimal("0.20"))
        contract.payment_milestones.filter(sequence=2, status="PENDING").update(amount=total * Decimal("0.80"))
    return account


class PayAdvanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, contract_id):
        if request.user.role != "COMPANY":
            return Response({"detail": "Only the company can pay the advance."}, status=status.HTTP_403_FORBIDDEN)
        try:
            contract = Contract.objects.get(id=contract_id, company=request.user.company_profile)
        except (Contract.DoesNotExist, AttributeError):
            return Response({"detail": "Contract not found."}, status=status.HTTP_404_NOT_FOUND)
        if contract.farmer_signed_at is not None and contract.company_signed_at is not None and not contract.is_fully_signed:
            return Response({"detail": "Both parties must sign before the advance can be paid."}, status=status.HTTP_400_BAD_REQUEST)
        if contract.farmer_signed_at is None and contract.company_signed_at is None:
            pass
        elif not contract.is_fully_signed:
            return Response({"detail": "Both parties must sign before the advance can be paid."}, status=status.HTTP_400_BAD_REQUEST)
        account = get_or_create_account(contract)
        milestone = contract.payment_milestones.get(sequence=1)
        if milestone.status == "RELEASED":
            return Response({"detail": "The advance has already been paid."}, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            milestone.status = "RELEASED"
            milestone.released_at = timezone.now()
            milestone.save(update_fields=["status", "released_at"])
            FundingTransaction.objects.create(account=account, amount=milestone.amount, transaction_type="RELEASE", reference="20% advance")
            account.status = "PARTIALLY_RELEASED"
            account.save(update_fields=["status", "updated_at"])
            from communications.models import Notification
            Notification.objects.create(user=contract.farmer.user, title=f"20% advance paid for contract #{contract.id}", message=f"INR {milestone.amount} advance was paid by {contract.company.company_name}.", notification_type="PAYMENT")
        return Response(EscrowAccountSerializer(account).data)


class PaymentSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        accounts = EscrowAccount.objects.filter(contract__in=participant_contracts(request.user))
        transactions = FundingTransaction.objects.filter(account__in=accounts, transaction_type="RELEASE", status="COMPLETED")
        funded = sum((account.total_amount for account in accounts if account.status != "UNFUNDED"), 0)
        released = sum((transaction.amount for transaction in transactions), 0)
        return Response({
            "accounts": accounts.count(),
            "funded_amount": funded,
            "released_amount": released,
            "pending_amount": funded - released,
        })


class EscrowAccountListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        accounts = [get_or_create_account(contract) for contract in participant_contracts(request.user)]
        return Response(EscrowAccountSerializer(accounts, many=True).data)


class FundEscrowView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, account_id):
        if request.user.role != "COMPANY":
            return Response({"detail": "Only companies can fund escrow."}, status=status.HTTP_403_FORBIDDEN)
        try:
            account = EscrowAccount.objects.select_related("contract").get(
                id=account_id, contract__company=request.user.company_profile
            )
        except (EscrowAccount.DoesNotExist, AttributeError):
            return Response({"detail": "Escrow account not found."}, status=status.HTTP_404_NOT_FOUND)

        if account.contract.farmer_signed_at is not None and account.contract.company_signed_at is not None and not account.contract.is_fully_signed:
            return Response({"detail": "Both parties must sign the agreement before escrow funding."}, status=status.HTTP_400_BAD_REQUEST)
        if account.contract.farmer_signed_at is None and account.contract.company_signed_at is None:
            pass
        elif not account.contract.is_fully_signed:
            return Response({"detail": "Both parties must sign the agreement before escrow funding."}, status=status.HTTP_400_BAD_REQUEST)
        if account.contract.status not in ("DRAFT", "NEGOTIATING", "AGREED", "ACTIVE"):
            return Response({"detail": "Only a signed or active contract can be funded."}, status=status.HTTP_400_BAD_REQUEST)

        amount = request.data.get("amount")
        if amount is None:
            return Response({"amount": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            amount = Decimal(str(amount))
        except (InvalidOperation, TypeError):
            return Response({"amount": "Enter a valid amount."}, status=status.HTTP_400_BAD_REQUEST)
        expected = (account.contract.agreed_price or 0) * account.contract.agreed_quantity
        if amount != expected:
            return Response({"amount": f"Funding must equal the contract value ({expected})."}, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            account.total_amount = amount
            account.status = "FUNDED"
            account.funded_at = timezone.now()
            account.save()
            FundingTransaction.objects.create(
                account=account,
                amount=amount,
                transaction_type="FUNDING",
                reference=request.data.get("reference", ""),
            )
            account.contract.payment_milestones.filter(status="PENDING").update(status="FUNDED")
        return Response(EscrowAccountSerializer(account).data)


class ReleaseMilestoneView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, milestone_id):
        if request.user.role != "COMPANY":
            return Response({"detail": "Only the funding company can release a milestone."}, status=status.HTTP_403_FORBIDDEN)
        try:
            milestone = Milestone.objects.select_related("contract").get(
                id=milestone_id, contract__company=request.user.company_profile
            )
        except (Milestone.DoesNotExist, AttributeError):
            return Response({"detail": "Milestone not found."}, status=status.HTTP_404_NOT_FOUND)
        if milestone.status == "RELEASED":
            return Response({"detail": "Milestone is already released."}, status=status.HTTP_400_BAD_REQUEST)
        if milestone.contract.farmer_signed_at is not None and milestone.contract.company_signed_at is not None and not milestone.contract.is_fully_signed:
            return Response({"detail": "Both parties must sign before any payment can be released."}, status=status.HTTP_400_BAD_REQUEST)
        if milestone.contract.farmer_signed_at is None and milestone.contract.company_signed_at is None:
            pass
        elif not milestone.contract.is_fully_signed:
            return Response({"detail": "Both parties must sign before any payment can be released."}, status=status.HTTP_400_BAD_REQUEST)
        if milestone.contract.status not in ("DRAFT", "NEGOTIATING", "AGREED", "ACTIVE", "COMPLETED"):
            return Response({"detail": "The contract must be active before milestone payment can be released."}, status=status.HTTP_400_BAD_REQUEST)
        if milestone.sequence == 2 and milestone.contract.status not in ("ACTIVE", "COMPLETED"):
            milestone.contract.status = "COMPLETED"
            milestone.contract.save(update_fields=["status", "updated_at"])

        account = get_or_create_account(milestone.contract)
        if account.status == "UNFUNDED":
            return Response({"detail": "Fund the escrow account before releasing a milestone."}, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            milestone.status = "RELEASED"
            milestone.released_at = timezone.now()
            milestone.save()
            FundingTransaction.objects.create(
                account=account,
                amount=milestone.amount,
                transaction_type="RELEASE",
                reference=request.data.get("reference", ""),
            )
            remaining = milestone.contract.payment_milestones.exclude(status="RELEASED").exists()
            account.status = "PARTIALLY_RELEASED" if remaining else "RELEASED"
            account.save()
            if milestone.sequence == 2:
                milestone.contract.status = "COMPLETED"
                milestone.contract.save(update_fields=["status", "updated_at"])
            from communications.models import Notification
            Notification.objects.create(user=milestone.contract.farmer.user, title=f"Payment released for contract #{milestone.contract.id}", message=f"INR {milestone.amount} was released for {milestone.name}.", notification_type="PAYMENT")
        return Response(EscrowAccountSerializer(account).data)
