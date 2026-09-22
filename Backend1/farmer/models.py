from django.db import models
from Accounts.models import FarmerProfile

class Crop(models.Model):
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name="crops")
    name = models.CharField(max_length=100)
    variety = models.CharField(max_length=100)
    expected_quantity = models.DecimalField(max_digits=10, decimal_places=2) # in quintals or kg
    expected_price = models.DecimalField(max_digits=10, decimal_places=2)
    sowing_date = models.DateField()
    expected_harvest_date = models.DateField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.farmer.farm_name}"
