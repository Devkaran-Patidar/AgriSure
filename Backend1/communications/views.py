from django.utils import timezone
from django.db import models
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Message, Notification
from .serializers import MessageSerializer, NotificationSerializer

class NotificationListView(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): return Notification.objects.filter(user=self.request.user).order_by("-created_at")
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class MarkNotificationReadView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["patch", "post"]
    def get_queryset(self): return Notification.objects.filter(user=self.request.user)
    def perform_update(self, serializer): serializer.save(is_read=True)

class MessageListCreateView(generics.ListCreateAPIView, generics.DestroyAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Message.objects.filter(
            models.Q(sender=self.request.user) | models.Q(recipient=self.request.user)
        ).select_related("sender", "recipient", "contract__crop").order_by("-created_at")
    def perform_create(self, serializer): serializer.save(sender=self.request.user)

    def perform_destroy(self, instance):
        if instance.sender_id != self.request.user.id:
            raise PermissionDenied("Only the sender can delete this message.")
        instance.delete()
