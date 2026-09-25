from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings

from .models import User, OTPVerification, VerificationDocument
from .serializer import UserSerializer, FarmerProfileSerializer, CompanyProfileSerializer


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

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
        # is_verified=True,
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

    tokens = get_tokens_for_user(user)

    return Response(
        {
            "message": "Login successful",
            "access": tokens["access"],
            "refresh": tokens["refresh"],
            "user": response_data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def registerView(request):
    data = request.data.dict()
    for profile_key in ("farmer", "company"):
        profile_data = data.get(profile_key)
        if isinstance(profile_data, str):
            import json
            try:
                data[profile_key] = json.loads(profile_data)
            except json.JSONDecodeError:
                return Response(
                    {"message": f"Invalid {profile_key} registration data."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

    serializer = UserSerializer(
        data=data
    )

    if serializer.is_valid():
        user = serializer.save()
        for uploaded_file in request.FILES.getlist("verification_documents") + request.FILES.getlist("documents"):
            VerificationDocument.objects.create(user=user, file=uploaded_file)
        user.is_active = False # Deactivate until OTP verified
        user.save()

        # Generate and send OTP
        otp_code = OTPVerification.generate_otp()
        OTPVerification.objects.create(user=user, otp_code=otp_code)
        
        send_mail(
            'Your AgriContract Verification Code',
            f'Your OTP is {otp_code}. It expires in 10 minutes.',
            'noreply@agricontract.com',
            [user.email],
            fail_silently=False,
        )

        return Response(
            {
                "message": "Registration successful. Please verify your email with the OTP sent.",
                "email": user.email
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

@api_view(["POST"])
def verifyOTPView(request):
    email = request.data.get("email")
    otp_code = request.data.get("otp")

    if not email or not otp_code:
        return Response({"message": "Email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        otp_record = OTPVerification.objects.filter(user=user, is_verified=False).latest('created_at')
    except OTPVerification.DoesNotExist:
        return Response({"message": "No pending OTP found."}, status=status.HTTP_400_BAD_REQUEST)

    if otp_record.is_expired():
        return Response({"message": "OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

    if otp_record.otp_code != str(otp_code):
        return Response({"message": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

    # Verify user
    otp_record.is_verified = True
    otp_record.save()

    user.is_active = True
    user.save()

    return Response({"message": "Email verified successfully. You can now login."}, status=status.HTTP_200_OK)

from rest_framework.permissions import IsAuthenticated

@api_view(["GET", "PATCH", "PUT"])
def profileView(request):
    if not request.user.is_authenticated:
        return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        
    user = request.user
    if request.method in ["PATCH", "PUT"]:
        password = request.data.get("new_password")
        if password:
            current_password = request.data.get("current_password")
            if not current_password or not user.check_password(current_password):
                return Response(
                    {"message": "Current password is incorrect."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if len(password) < 8:
                return Response(
                    {"message": "New password must contain at least 8 characters."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.set_password(password)

        for field in ["first_name", "last_name", "phone"]:
            if field in request.data:
                setattr(user, field, request.data.get(field, ""))
        if request.FILES.get("avatar"):
            user.avatar = request.FILES["avatar"]
        user.save()

        profile_payload = request.data.get("farmer") if user.role == User.Roles.FARMER else request.data.get("company")
        if profile_payload:
            import json
            if isinstance(profile_payload, str):
                profile_payload = json.loads(profile_payload)
            profile = getattr(user, "farmer_profile", None) if user.role == User.Roles.FARMER else getattr(user, "company_profile", None)
            profile_serializer = FarmerProfileSerializer if user.role == User.Roles.FARMER else CompanyProfileSerializer
            if profile:
                serializer = profile_serializer(profile, data=profile_payload, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
        if password:
            user.save(update_fields=["password"])
    response_data = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "avatar_url": request.build_absolute_uri(user.avatar.url) if user.avatar else None,
        "role": user.role,
    }

    if user.role == User.Roles.FARMER:
        try:
            profile = user.farmer_profile
            response_data["farmer"] = {
                "id": profile.id,
                "farm_name": profile.farm_name,
                "address": profile.address,
                "state": profile.state,
                "district": profile.district,
                "land_size_acres": str(profile.land_size_acres),
                "khasra_number": profile.khasra_number,
                "aadhar_number": profile.aadhar_number,
                "pan_number": profile.pan_number,
                "bank_account_number": profile.bank_account_number,
                "ifsc_code": profile.ifsc_code,
                "bank_name": profile.bank_name,
                "branch_name": profile.branch_name,
                "verification_documents": [
                    request.build_absolute_uri(document.file.url)
                    for document in user.verification_documents.all()
                ],
                "verification_status": profile.verification_status,
                "created_at": profile.created_at,
            }
        except:
            pass
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
                "verification_documents": [
                    request.build_absolute_uri(document.file.url)
                    for document in user.verification_documents.all()
                ],
                "verification_status": profile.verification_status,
            }
        except:
            pass

    return Response(response_data, status=status.HTTP_200_OK)