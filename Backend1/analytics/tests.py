from django.test import TestCase
from rest_framework.test import APIClient

from Accounts.models import User


class AdminApiTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(email="admin@test.com", username="admin@test.com", password="StrongPass123!", role="ADMIN", is_active=True)
        self.farmer = User.objects.create_user(email="farmer@test.com", username="farmer@test.com", password="StrongPass123!", role="FARMER", is_active=True)
        self.client = APIClient()

    def test_admin_can_read_summary_and_users(self):
        self.client.force_authenticate(user=self.admin)
        self.assertEqual(self.client.get("/api/admin/summary/").status_code, 200)
        self.assertEqual(self.client.get("/api/admin/users/").status_code, 200)

    def test_non_admin_cannot_read_admin_apis(self):
        self.client.force_authenticate(user=self.farmer)
        self.assertEqual(self.client.get("/api/admin/summary/").status_code, 403)
        self.assertEqual(self.client.get("/api/admin/users/").status_code, 403)
