from django.db import models
from contracts.models import Contract


class EscrowAccount(models.Model):
    STATUS_CHOICES = (
        ("UNFUNDED", "Unfunded"),
        ("FUNDED", "Funded"),
        ("PARTIALLY_RELEASED", "Partially released"),
        ("RELEASED", "Released"),
    )

    contract = models.OneToOneField(Contract, on_delete=models.CASCADE, related_name="escrow_account")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=24, choices=STATUS_CHOICES, default="UNFUNDED")
    funded_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)


class FundingTransaction(models.Model):
    TYPE_CHOICES = (("FUNDING", "Funding"), ("RELEASE", "Release"))
    STATUS_CHOICES = (("PENDING", "Pending"), ("COMPLETED", "Completed"))

    account = models.ForeignKey(EscrowAccount, on_delete=models.CASCADE, related_name="transactions")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=12, choices=TYPE_CHOICES)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="COMPLETED")
    reference = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Milestone(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("FUNDED", "Funded"),
        ("RELEASED", "Released"),
    )

    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name="payment_milestones")
    name = models.CharField(max_length=160)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    sequence = models.PositiveIntegerField(default=1)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="PENDING")
    released_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["sequence", "id"]
        unique_together = ["contract", "sequence"]
