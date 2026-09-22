from rest_framework import serializers
from .models import CropUpdate, Inspection

MAX_PHOTO_SIZE = 5 * 1024 * 1024
ALLOWED_PHOTO_TYPES = {"image/jpeg", "image/png", "image/webp"}


class CropUpdateSerializer(serializers.ModelSerializer):
    crop_name = serializers.CharField(source="crop.name", read_only=True)
    contract_id = serializers.IntegerField(source="contract.id", read_only=True)
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = CropUpdate
        fields = [
            "id", "crop", "crop_name", "contract", "contract_id", "stage",
            "completion_percent", "notes", "latitude", "longitude", "photo",
            "photo_url", "created_at",
        ]
        read_only_fields = ["contract", "photo_url"]

    def get_photo_url(self, obj):
        request = self.context.get("request")
        return request.build_absolute_uri(obj.photo.url) if request and obj.photo else None

    def validate_photo(self, photo):
        if photo.size > MAX_PHOTO_SIZE:
            raise serializers.ValidationError("Photo must be 5 MB or smaller.")
        if photo.content_type not in ALLOWED_PHOTO_TYPES:
            raise serializers.ValidationError("Photo must be JPEG, PNG, or WebP.")
        return photo


class InspectionSerializer(serializers.ModelSerializer):
    crop_name = serializers.CharField(source="contract.crop.name", read_only=True)

    class Meta:
        model = Inspection
        fields = [
            "id", "contract", "crop_name", "scheduled_for", "status",
            "quality_grade", "certificate_reference", "notes", "created_at",
        ]
        read_only_fields = ["status", "created_at"]
