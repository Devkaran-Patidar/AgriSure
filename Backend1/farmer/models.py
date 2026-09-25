from django.db import models
from Accounts.models import FarmerProfile


class Crop(models.Model):

    FARMING_METHOD_CHOICES = [
        ("Conventional", "Conventional"),
        ("Organic", "Organic"),
        ("Natural", "Natural Farming"),
        ("Integrated", "Integrated Farming"),
    ]

    QUALITY_GRADE_CHOICES = [
        ("Grade A", "Grade A"),
        ("Grade B", "Grade B"),
        ("Grade C", "Grade C"),
        ("Premium", "Premium"),
    ]

    IRRIGATION_TYPE_CHOICES = [
        ("Borewell", "Borewell"),
        ("Canal", "Canal"),
        ("Rain-fed", "Rain-fed"),
        ("Drip", "Drip Irrigation"),
        ("Sprinkler", "Sprinkler"),
    ]

    farmer = models.ForeignKey(
        FarmerProfile,
        on_delete=models.CASCADE,
        related_name="crops"
    )

    # Basic crop information
    name = models.CharField(max_length=100)
    variety = models.CharField(max_length=100)

    # Production information
    cultivation_area = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        help_text="Cultivation area in acres"
    )

    expected_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Expected production in quintals"
    )

    minimum_contract_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Minimum quantity available for contract in quintals"
    )

    # Price expectation
    expected_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Expected price per quintal"
    )

    # Farming details
    farming_method = models.CharField(
        max_length=30,
        choices=FARMING_METHOD_CHOICES,
        default="Conventional"
    )

    quality_grade = models.CharField(
        max_length=30,
        choices=QUALITY_GRADE_CHOICES,
        default="Grade A"
    )

    irrigation_type = models.CharField(
        max_length=30,
        choices=IRRIGATION_TYPE_CHOICES,
        default="Borewell"
    )

    # Crop timeline
    sowing_date = models.DateField()
    expected_harvest_date = models.DateField()

    # Contract delivery
    delivery_location = models.CharField(
        max_length=255,
        default="Farm gate"
    )

    description = models.TextField(
        blank=True
    )

    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.name} - {self.farmer.farm_name}"