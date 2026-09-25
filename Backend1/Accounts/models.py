from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import random


class User(AbstractUser):
    class Roles(models.TextChoices):
        FARMER = "FARMER", "Farmer"
        COMPANY = "COMPANY", "Company"
        ADMIN = "ADMIN", "Admin"

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.FARMER,
    )
    is_verified = models.BooleanField(default=False)

    # Login using email
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return f"{self.email} - {self.role}"


class OTPVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="otps")
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def is_expired(self):
        return (timezone.now() - self.created_at).total_seconds() > 600

    @classmethod
    def generate_otp(cls):
        return str(random.randint(100000, 999999))


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
    aadhar_number = models.CharField(max_length=20, blank=True, null=True)
    pan_number = models.CharField(max_length=20, blank=True, null=True)
    bank_account_number = models.CharField(max_length=50, blank=True, null=True)
    ifsc_code = models.CharField(max_length=20, blank=True, null=True)
    bank_name = models.CharField(max_length=150, blank=True, null=True)
    branch_name = models.CharField(max_length=150, blank=True, null=True)

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


class VerificationDocument(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="verification_documents",
    )
    file = models.FileField(upload_to="verification_documents/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.file.name}"