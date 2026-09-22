from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from .views import loginView, registerView, verifyOTPView, profileView

urlpatterns = [
    path(
        "auth/login/",
        loginView,
        name="login",
    ),
    path(
        "auth/register/",
        registerView,
        name="register",
    ),
    path(
        "auth/verify-otp/",
        verifyOTPView,
        name="verify_otp",
    ),
    path(
        "auth/token/refresh/", 
        TokenRefreshView.as_view(), 
        name="token_refresh"
    ),
    path(
        "auth/profile/",
        profileView,
        name="profile"
    )
]