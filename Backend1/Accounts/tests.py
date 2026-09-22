from django.test import TestCase
from rest_framework.test import APIClient

from .models import User


class AuthenticationTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			email="farmer@example.com",
			username="farmer@example.com",
			password="StrongPass123!",
			role="FARMER",
			is_active=True,
		)
		self.client = APIClient()

	def test_login_returns_jwt_for_active_user(self):
		response = self.client.post(
			"/api/accounts/auth/login/",
			{"email": "farmer@example.com", "password": "StrongPass123!"},
			format="json",
		)
		self.assertEqual(response.status_code, 200)
		self.assertIn("access", response.data)
		self.assertEqual(response.data["user"]["role"], "FARMER")

	def test_inactive_user_cannot_login(self):
		self.user.is_active = False
		self.user.save(update_fields=["is_active"])
		response = self.client.post(
			"/api/accounts/auth/login/",
			{"email": "farmer@example.com", "password": "StrongPass123!"},
			format="json",
		)
		self.assertEqual(response.status_code, 401)

	def test_unauthenticated_profile_is_rejected(self):
		response = self.client.get("/api/accounts/auth/profile/")
		self.assertEqual(response.status_code, 401)
