from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Roles(models.TextChoices):
        FARMER = "FARMER", "Farmer"
        COMPANY = "COMPANY", "Company"
        ADMIN = "ADMIN", "Admin"

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.FARMER,
    )

    # Login using email
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return f"{self.email} - {self.role}"


class FarmerProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="farmer_profile",
    )

    farm_name = models.CharField(max_length=200)
    address = models.TextField()
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)

    land_size_acres = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    khasra_number = models.CharField(max_length=100)

    verification_status = models.CharField(
        max_length=20,
        default="PENDING",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.farm_name} - {self.user.email}"


class CompanyProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="company_profile",
    )

    company_name = models.CharField(max_length=220)

    business_type = models.CharField(
        max_length=100,
    )

    contact_person = models.CharField(
        max_length=150,
    )

    company_address = models.TextField()

    gst_number = models.CharField(
        max_length=80,
        blank=True,
    )

    licence_number = models.CharField(
        max_length=100,
        blank=True,
    )

    verification_status = models.CharField(
        max_length=20,
        default="PENDING",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company_name} - {self.user.email}"