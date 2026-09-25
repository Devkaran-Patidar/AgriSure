from django.core.mail import send_mail
from django.conf import settings


def send_welcome_email(to_email, username):
    subject = "Welcome to AgriSure"

    message = f"""
Hello {username},

Welcome to AgriSure.

Your account has been successfully created.

Thank you,
AgriSure Team

"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [to_email],
        fail_silently=False,
    )



def Verification_email(to_email, username, verification_status):
    subject = "AgriSure Account Verification Status"

    message = f"""      
Hello {username},   

Your account verification status is: {verification_status}.
If you have any questions, please contact our support team.

Thank you,
AgriSure Team
"""
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [to_email],
        fail_silently=False,
    )