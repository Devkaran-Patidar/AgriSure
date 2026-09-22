from datetime import date
from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile

from Accounts.models import CompanyProfile, FarmerProfile, User
from contracts.models import Contract
from farmer.models import Crop


class MonitoringAccessTests(TestCase):
    def setUp(self):
        self.farmer = User.objects.create_user(email="farmer@test.com", username="farmer@test.com", password="StrongPass123!", role="FARMER", is_active=True)
        farmer_profile = FarmerProfile.objects.create(user=self.farmer, farm_name="Farm", address="Test", state="Test", district="Test", land_size_acres=Decimal("4"), khasra_number="K1")
        self.company = User.objects.create_user(email="company@test.com", username="company@test.com", password="StrongPass123!", role="COMPANY", is_active=True)
        company_profile = CompanyProfile.objects.create(user=self.company, company_name="Buyer", business_type="BUYER", contact_person="Test", company_address="Test")
        self.crop = Crop.objects.create(farmer=farmer_profile, name="Wheat", variety="Test", expected_quantity=10, expected_price=20, sowing_date=date(2026, 1, 1), expected_harvest_date=date(2026, 4, 1))
        self.contract = Contract.objects.create(farmer=farmer_profile, company=company_profile, crop=self.crop, agreed_quantity=10, agreed_price=20)
        self.client = APIClient()

    def test_farmer_can_submit_update_and_company_can_read_it(self):
        self.client.force_authenticate(user=self.farmer)
        created = self.client.post("/api/monitoring/updates/", {"crop": self.crop.id, "stage": "GROWING", "completion_percent": 40, "notes": "Healthy"}, format="json")
        self.assertEqual(created.status_code, 201)
        self.client.force_authenticate(user=self.company)
        updates = self.client.get("/api/monitoring/updates/")
        self.assertEqual(updates.status_code, 200)
        self.assertEqual(len(updates.data), 1)

    def test_company_cannot_submit_farmer_update(self):
        self.client.force_authenticate(user=self.company)
        response = self.client.post("/api/monitoring/updates/", {"crop": self.crop.id, "stage": "GROWING", "completion_percent": 40}, format="json")
        self.assertEqual(response.status_code, 403)

    def test_invalid_photo_type_is_rejected(self):
        self.client.force_authenticate(user=self.farmer)
        photo = SimpleUploadedFile("field.exe", b"not an image", content_type="application/octet-stream")
        response = self.client.post("/api/monitoring/updates/", {"crop": self.crop.id, "stage": "GROWING", "completion_percent": 40, "photo": photo}, format="multipart")
        self.assertEqual(response.status_code, 400)
