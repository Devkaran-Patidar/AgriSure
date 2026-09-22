from rest_framework import serializers
from .models import Dispute, DisputeEvidence

MAX_EVIDENCE_SIZE = 5 * 1024 * 1024
ALLOWED_EVIDENCE_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain"}

class DisputeSerializer(serializers.ModelSerializer):
    raised_by_name = serializers.CharField(source="raised_by.email", read_only=True)
    class Meta:
        model = Dispute
        fields = "__all__"
        read_only_fields = ["raised_by", "created_at", "resolved_at"]
class DisputeEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DisputeEvidence
        fields = "__all__"
        read_only_fields = ["uploaded_by", "created_at"]

    def validate_file(self, uploaded_file):
        if uploaded_file.size > MAX_EVIDENCE_SIZE:
            raise serializers.ValidationError("Evidence must be 5 MB or smaller.")
        if uploaded_file.content_type not in ALLOWED_EVIDENCE_TYPES:
            raise serializers.ValidationError("Evidence must be PDF, JPEG, PNG, WebP, or plain text.")
        return uploaded_file
