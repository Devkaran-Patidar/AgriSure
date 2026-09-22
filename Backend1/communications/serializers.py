from rest_framework import serializers
from .models import Message, Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
        read_only_fields = ["user", "created_at"]

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.email", read_only=True)
    recipient_name = serializers.CharField(source="recipient.email", read_only=True)
    class Meta:
        model = Message
        fields = ["id", "sender", "sender_name", "recipient", "recipient_name", "subject", "body", "created_at", "read_at"]
        read_only_fields = ["sender", "created_at", "read_at"]
