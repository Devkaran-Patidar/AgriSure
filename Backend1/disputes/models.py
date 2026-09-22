from django.conf import settings
from django.db import models
from contracts.models import Contract

class Dispute(models.Model):
    STATUS_CHOICES = (("OPEN", "Open"), ("UNDER_REVIEW", "Under review"), ("RESOLVED", "Resolved"), ("REJECTED", "Rejected"))
    contract = models.ForeignKey(Contract, on_delete=models.PROTECT, related_name="disputes")
    raised_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="raised_disputes")
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="OPEN")
    priority = models.CharField(max_length=20, default="MEDIUM")
    outcome = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

class DisputeEvidence(models.Model):
    dispute = models.ForeignKey(Dispute, on_delete=models.CASCADE, related_name="evidence")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    file = models.FileField(upload_to="disputes/%Y/%m/")
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
