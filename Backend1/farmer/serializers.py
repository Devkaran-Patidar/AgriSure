from rest_framework import serializers
from .models import Crop


class CropSerializer(serializers.ModelSerializer):
    request_status = serializers.SerializerMethodField()

    class Meta:
        model = Crop
        fields = [
            "id",
            "name",
            "variety",
            "cultivation_area",
            "expected_quantity",
            "minimum_contract_quantity",
            "expected_price",
            "farming_method",
            "quality_grade",
            "irrigation_type",
            "sowing_date",
            "expected_harvest_date",
            "delivery_location",
            "description",
            "created_at",
            "updated_at",
            "request_status",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def get_request_status(self, obj):
        request = self.context.get("request")
        if not request or not hasattr(request.user, "company_profile"):
            return None
        contract = obj.contracts.filter(company=request.user.company_profile).exclude(status="CANCELLED").order_by("-created_at").first()
        return contract.status.lower() if contract else None

    def validate(self, data):
        cultivation_area = data.get("cultivation_area")
        expected_quantity = data.get("expected_quantity")
        minimum_quantity = data.get("minimum_contract_quantity")
        sowing_date = data.get("sowing_date")
        harvest_date = data.get("expected_harvest_date")

        if cultivation_area is not None and cultivation_area <= 0:
            raise serializers.ValidationError({
                "cultivation_area": "Cultivation area must be greater than 0."
            })

        if expected_quantity is not None and expected_quantity <= 0:
            raise serializers.ValidationError({
                "expected_quantity": "Expected quantity must be greater than 0."
            })

        if minimum_quantity is not None and minimum_quantity <= 0:
            raise serializers.ValidationError({
                "minimum_contract_quantity": "Minimum contract quantity must be greater than 0."
            })

        if (
            expected_quantity is not None
            and minimum_quantity is not None
            and minimum_quantity > expected_quantity
        ):
            raise serializers.ValidationError({
                "minimum_contract_quantity":
                    "Minimum contract quantity cannot exceed expected quantity."
            })

        if sowing_date and harvest_date and harvest_date <= sowing_date:
            raise serializers.ValidationError({
                "expected_harvest_date":
                    "Harvest date must be after the sowing date."
            })

        return data