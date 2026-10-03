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
    sender_display_name = serializers.SerializerMethodField()
    recipient_display_name = serializers.SerializerMethodField()
    crop_name = serializers.CharField(source="contract.crop.name", read_only=True, allow_null=True)
    class Meta:
        model = Message
        fields = ["id", "sender", "sender_name", "sender_display_name", "recipient", "recipient_name", "recipient_display_name", "contract", "crop_name", "subject", "body", "created_at", "read_at"]
        read_only_fields = ["sender", "created_at", "read_at"]

    def get_sender_display_name(self, obj):
        return self._display_name(obj.sender)

    def get_recipient_display_name(self, obj):
        return self._display_name(obj.recipient)

    @staticmethod
    def _display_name(user):
        if user.role == "FARMER" and hasattr(user, "farmer_profile"):
            return user.farmer_profile.farm_name
        if user.role == "COMPANY" and hasattr(user, "company_profile"):
            return user.company_profile.company_name
        return user.get_full_name() or user.email

    def validate(self, attrs):
        contract = attrs.get("contract")
        recipient = attrs.get("recipient")
        sender = self.context["request"].user
        if contract:
            participant_ids = {contract.farmer.user_id, contract.company.user_id}
            if sender.id not in participant_ids or not recipient or recipient.id not in participant_ids:
                raise serializers.ValidationError("The message must be linked to a contract shared by both participants.")
            if sender.id == recipient.id:
                raise serializers.ValidationError("You cannot message yourself.")
        return attrs
