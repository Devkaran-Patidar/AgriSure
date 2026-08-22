
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import User
from .serializer import UserSerializer


@api_view(["POST"])
def loginView(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response(
            {
                "message": "Email and password are required."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(
        request,
        username=email,
        password=password,
    )

    if user is None:
        return Response(
            {
                "message": "Invalid email or password."
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {
                "message": "This account is inactive."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    response_data = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "role": user.role,
    }

    # Add farmer profile
    if user.role == User.Roles.FARMER:
        try:
            profile = user.farmer_profile

            response_data["farmer"] = {
                "id": profile.id,
                "farm_name": profile.farm_name,
                "address": profile.address,
                "state": profile.state,
                "district": profile.district,
                "land_size_acres": str(
                    profile.land_size_acres
                ),
                "khasra_number": profile.khasra_number,
                "verification_status": profile.verification_status,
            }

        except User.farmer_profile.RelatedObjectDoesNotExist:
            response_data["farmer"] = None

    # Add company profile
    elif user.role == User.Roles.COMPANY:
        try:
            profile = user.company_profile

            response_data["company"] = {
                "id": profile.id,
                "company_name": profile.company_name,
                "business_type": profile.business_type,
                "contact_person": profile.contact_person,
                "company_address": profile.company_address,
                "gst_number": profile.gst_number,
                "licence_number": profile.licence_number,
                "verification_status": profile.verification_status,
            }

        except User.company_profile.RelatedObjectDoesNotExist:
            response_data["company"] = None

    return Response(
        {
            "message": "Login successful",
            "user": response_data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def registerView(request):
    serializer = UserSerializer(
        data=request.data
    )

    if serializer.is_valid():
        user = serializer.save()

        return Response(
            {
                "message": "Registration successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "role": user.role,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "phone": user.phone,
                },
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(
        {
            "message": "Registration failed",
            "errors": serializer.errors,
        },
        status=status.HTTP_400_BAD_REQUEST,
    )