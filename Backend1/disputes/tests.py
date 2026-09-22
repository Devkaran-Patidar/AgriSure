from datetime import date
from decimal import Decimal

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from Accounts.models import CompanyProfile, FarmerProfile, User
from contracts.models import Contract
from farmer.models import Crop


class DisputeEvidenceTests(TestCase):
    def setUp(self):
        farmer = User.objects.create_user(email="farmer@test.com", username="farmer@test.com", password="StrongPass123!", role="FARMER", is_active=True)
        farmer_profile = FarmerProfile.objects.create(user=farmer, farm_name="Farm", address="Test", state="Test", district="Test", land_size_acres=Decimal("4"), khasra_number="K1")
        company = User.objects.create_user(email="company@test.com", username="company@test.com", password="StrongPass123!", role="COMPANY", is_active=True)
        company_profile = CompanyProfile.objects.create(user=company, company_name="Buyer", business_type="BUYER", contact_person="Test", company_address="Test")
        crop = Crop.objects.create(farmer=farmer_profile, name="Wheat", variety="Test", expected_quantity=10, expected_price=20, sowing_date=date(2026, 1, 1), expected_harvest_date=date(2026, 4, 1))
        self.contract = Contract.objects.create(farmer=farmer_profile, company=company_profile, crop=crop, agreed_quantity=10, agreed_price=20)
        self.client = APIClient()
        self.client.force_authenticate(user=farmer)

    def test_participant_can_create_dispute_but_invalid_evidence_is_rejected(self):
        dispute = self.client.post("/api/disputes/", {"contract": self.contract.id, "title": "Quality issue", "description": "Evidence needed"}, format="json")
        self.assertEqual(dispute.status_code, 201)
        evidence = SimpleUploadedFile("script.exe", b"unsafe", content_type="application/octet-stream")
        response = self.client.post("/api/disputes/evidence/", {"dispute": dispute.data["id"], "file": evidence}, format="multipart")
        self.assertEqual(response.status_code, 400)