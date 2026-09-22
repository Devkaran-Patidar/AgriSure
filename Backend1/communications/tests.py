from django.test import TestCase
from rest_framework.test import APIClient

from Accounts.models import User
from .models import Message, Notification


class CommunicationsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="user@test.com", username="user@test.com", password="StrongPass123!", role="FARMER", is_active=True)
        self.other = User.objects.create_user(email="other@test.com", username="other@test.com", password="StrongPass123!", role="COMPANY", is_active=True)
        Notification.objects.create(user=self.user, title="Test", message="Hello")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_notifications_are_private_and_can_be_marked_read(self):
        response = self.client.get("/api/communications/notifications/")
        self.assertEqual(response.status_code, 200)
        notification_id = response.data[0]["id"]
        marked = self.client.patch(f"/api/communications/notifications/{notification_id}/read/", {}, format="json")
        self.assertEqual(marked.status_code, 200)
        self.assertTrue(Notification.objects.get(id=notification_id).is_read)

    def test_message_is_sent_as_authenticated_user(self):
        response = self.client.post("/api/communications/messages/", {"recipient": self.other.id, "subject": "Hello", "body": "Test message"}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Message.objects.get(id=response.data["id"]).sender_id, self.user.id)
