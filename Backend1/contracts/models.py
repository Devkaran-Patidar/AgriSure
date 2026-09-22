from django.db import models
from Accounts.models import FarmerProfile, CompanyProfile
from farmer.models import Crop

class Contract(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('NEGOTIATING', 'Negotiating'),
        ('AGREED', 'Agreed'),
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name="contracts")
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name="contracts")
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name="contracts")
    
    agreed_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    agreed_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_location = models.CharField(max_length=255, blank=True)
    payment_terms = models.TextField(blank=True)
    terms_conditions = models.TextField(blank=True)
    farmer_approved_at = models.DateTimeField(null=True, blank=True)
    company_approved_at = models.DateTimeField(null=True, blank=True)
    farmer_signed_at = models.DateTimeField(null=True, blank=True)
    company_signed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Contract #{self.id} - {self.farmer.farm_name} / {self.company.company_name}"

    @property
    def is_fully_signed(self):
        return bool(self.farmer_signed_at and self.company_signed_at)
