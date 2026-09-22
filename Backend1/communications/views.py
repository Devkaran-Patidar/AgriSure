from django.utils import timezone
from rest_framework import generics, permissions
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

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Message.objects.filter(sender=self.request.user) | Message.objects.filter(recipient=self.request.user)
    def perform_create(self, serializer): serializer.save(sender=self.request.user)
