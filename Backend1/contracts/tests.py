from datetime import date
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from Accounts.models import CompanyProfile, FarmerProfile, User
from farmer.models import Crop
from contracts.models import Contract


class ContractWorkflowTests(TestCase):
	def setUp(self):
		self.farmer = User.objects.create_user(
			email="farmer-contracts@test.com",
			username="farmer-contracts@test.com",
			password="StrongPass123!",
			role="FARMER",
		)
		self.farmer_profile = FarmerProfile.objects.create(
			user=self.farmer,
			farm_name="Test Farm",
			address="Test address",
			state="Test state",
			district="Test district",
			land_size_acres=Decimal("10"),
			khasra_number="K-1",
		)
		self.company = self._create_company("company-contracts@test.com", "Test Company")
		self.second_company = self._create_company("second-company@test.com", "Second Company")
		self.crop = Crop.objects.create(
			farmer=self.farmer_profile,
			name="Wheat",
			variety="Test variety",
			expected_quantity=Decimal("100"),
			expected_price=Decimal("2500"),
			sowing_date=date(2026, 1, 1),
			expected_harvest_date=date(2026, 4, 1),
		)
		self.client = APIClient()

	def _create_company(self, email, name):
		user = User.objects.create_user(
			email=email,
			username=email,
			password="StrongPass123!",
			role="COMPANY",
		)
		CompanyProfile.objects.create(
			user=user,
			company_name=name,
			business_type="BUYER",
			contact_person="Test contact",
			company_address="Test address",
		)
		return user

	def _create_request(self, user=None):
		self.client.force_authenticate(user=user or self.company)
		response = self.client.post(
			"/api/contracts/",
			{"crop": self.crop.id, "agreed_quantity": "50"},
			format="json",
		)
		self.assertEqual(response.status_code, 201)
		return Contract.objects.get(pk=response.data["id"])

	def test_one_crop_cannot_be_claimed_by_two_companies(self):
		self._create_request()

		response = self.client.post(
			"/api/contracts/",
			{"crop": self.crop.id, "agreed_quantity": "50"},
			format="json",
		)

		self.assertEqual(response.status_code, 400)
		self.assertIn("already reserved", str(response.data))

	def test_company_can_delete_only_its_draft_request(self):
		contract = self._create_request()

		response = self.client.delete(f"/api/contracts/{contract.id}/")

		self.assertEqual(response.status_code, 204)
		contract.refresh_from_db()
		self.assertEqual(contract.status, "CANCELLED")

	def test_negotiation_is_closed_after_both_signatures(self):
		contract = Contract.objects.create(
			farmer=self.farmer_profile,
			company=self.company.company_profile,
			crop=self.crop,
			agreed_quantity=Decimal("50"),
			agreed_price=Decimal("2500"),
			status="ACTIVE",
			farmer_signed_at=timezone.now(),
			company_signed_at=timezone.now(),
		)
		self.client.force_authenticate(user=self.company)

		response = self.client.post(
			"/api/negotiations/",
			{"contract": contract.id, "offered_price": "2600"},
			format="json",
		)

		self.assertEqual(response.status_code, 400)

	def test_delivery_requires_both_signatures(self):
		contract = Contract.objects.create(
			farmer=self.farmer_profile,
			company=self.company.company_profile,
			crop=self.crop,
			agreed_quantity=Decimal("50"),
			agreed_price=Decimal("2500"),
			status="ACTIVE",
			farmer_signed_at=timezone.now(),
		)
		self.client.force_authenticate(user=self.farmer)

		response = self.client.post(f"/api/contracts/{contract.id}/deliver/")

		self.assertEqual(response.status_code, 400)

# Create your tests here.
