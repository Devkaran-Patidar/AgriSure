from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from .models import FarmerProfile, CompanyProfile


User = get_user_model()


class FarmerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmerProfile
        fields = [
            "farm_name",
            "address",
            "state",
            "district",
            "land_size_acres",
            "khasra_number",
            "verification_status",
            "created_at",
        ]
        read_only_fields = [
            "verification_status",
            "created_at",
        ]


class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = [
            "company_name",
            "business_type",
            "contact_person",
            "company_address",
            "gst_number",
            "licence_number",
            "verification_status",
            "created_at",
        ]
        read_only_fields = [
            "verification_status",
            "created_at",
        ]


class UserSerializer(serializers.ModelSerializer):
    farmer = FarmerProfileSerializer(required=False)
    company = CompanyProfileSerializer(required=False)

    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "password",
            "phone",
            "first_name",
            "last_name",
            "role",
            "farmer",
            "company",
        ]

        extra_kwargs = {
            "username": {
                "required": False,
            }
        }

    def validate(self, attrs):
        role = attrs.get("role")

        farmer_data = attrs.get("farmer")
        company_data = attrs.get("company")

        if role == User.Roles.FARMER:
            if not farmer_data:
                raise serializers.ValidationError({
                    "farmer": "Farmer details are required."
                })

        elif role == User.Roles.COMPANY:
            if not company_data:
                raise serializers.ValidationError({
                    "company": "Company details are required."
                })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        farmer_data = validated_data.pop("farmer", None)
        company_data = validated_data.pop("company", None)

        password = validated_data.pop("password")

        # Generate username if frontend doesn't send one
        if not validated_data.get("username"):
            validated_data["username"] = validated_data["email"]

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        if user.role == User.Roles.FARMER and farmer_data:
            FarmerProfile.objects.create(
                user=user,
                **farmer_data
            )

        elif user.role == User.Roles.COMPANY and company_data:
            CompanyProfile.objects.create(
                user=user,
                **company_data
            )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True
    )