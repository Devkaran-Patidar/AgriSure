from django.urls import path

from .views import loginView, registerView


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
]