from django.db import models
from contracts.models import Contract
from farmer.models import Crop


class CropUpdate(models.Model):
    STAGE_CHOICES = (
        ("PLANTED", "Planted"),
        ("GROWING", "Growing"),
        ("FLOWERING", "Flowering"),
        ("HARVEST_READY", "Harvest ready"),
        ("HARVESTED", "Harvested"),
    )

    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name="monitoring_updates")
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name="crop_updates", null=True, blank=True)
    stage = models.CharField(max_length=24, choices=STAGE_CHOICES)
    completion_percent = models.PositiveSmallIntegerField(default=0)
    notes = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    photo = models.ImageField(upload_to="crop-updates/%Y/%m/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class Inspection(models.Model):
    STATUS_CHOICES = (("REQUESTED", "Requested"), ("SCHEDULED", "Scheduled"), ("COMPLETED", "Completed"))

    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name="inspections")
    scheduled_for = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="REQUESTED")
    quality_grade = models.CharField(max_length=80, blank=True)
    certificate_reference = models.CharField(max_length=160, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
