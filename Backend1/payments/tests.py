from datetime import date
from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from Accounts.models import CompanyProfile, FarmerProfile, User
from contracts.models import Contract
from farmer.models import Crop
from .models import EscrowAccount, Milestone


class PaymentWorkflowTests(TestCase):
    def setUp(self):
        self.farmer = User.objects.create_user(
            email="farmer@test.com", username="farmer@test.com", password="StrongPass123!", role="FARMER"
        )
        self.farmer_profile = FarmerProfile.objects.create(
            user=self.farmer, farm_name="Test Farm", address="Test", state="Test", district="Test",
            land_size_acres=Decimal("10"), khasra_number="K-1"
        )
        self.company = User.objects.create_user(
            email="company@test.com", username="company@test.com", password="StrongPass123!", role="COMPANY"
        )
        self.company_profile = CompanyProfile.objects.create(
            user=self.company, company_name="Test Company", business_type="BUYER",
            contact_person="Test", company_address="Test"
        )
        crop = Crop.objects.create(
            farmer=self.farmer_profile, name="Wheat", variety="Test", expected_quantity=100,
            expected_price=25, sowing_date=date(2026, 1, 1), expected_harvest_date=date(2026, 4, 1)
        )
        self.contract = Contract.objects.create(
            farmer=self.farmer_profile, company=self.company_profile, crop=crop,
            agreed_quantity=100, agreed_price=2500
        )
        self.client = APIClient()

    def test_company_can_fund_and_release_milestone(self):
        self.client.force_authenticate(user=self.company)
        accounts = self.client.get("/api/payments/accounts/")
        self.assertEqual(accounts.status_code, 200)
        account_id = accounts.data[0]["id"]
        milestone_id = accounts.data[0]["milestones"][0]["id"]

        funded = self.client.post(f"/api/payments/accounts/{account_id}/fund/", {"amount": "250000"}, format="json")
        self.assertEqual(funded.status_code, 200)
        self.assertEqual(funded.data["status"], "FUNDED")

        released = self.client.post(f"/api/payments/milestones/{milestone_id}/release/")
        self.assertEqual(released.status_code, 200)
        self.assertEqual(released.data["status"], "PARTIALLY_RELEASED")
        final_milestone_id = released.data["milestones"][1]["id"]
        final_release = self.client.post(f"/api/payments/milestones/{final_milestone_id}/release/")
        self.assertEqual(final_release.status_code, 200)
        self.assertEqual(final_release.data["status"], "RELEASED")

    def test_farmer_cannot_fund_or_release(self):
        self.client.force_authenticate(user=self.farmer)
        account = self.client.get("/api/payments/accounts/").data[0]
        self.assertEqual(
            self.client.post(f"/api/payments/accounts/{account['id']}/fund/", {"amount": "2500"}, format="json").status_code,
            403,
        )
        self.assertEqual(
            self.client.post(f"/api/payments/milestones/{account['milestones'][0]['id']}/release/").status_code,
            403,
        )
