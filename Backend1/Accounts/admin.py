from django.contrib import admin

# Register your models here.
from .models import User, FarmerProfile, CompanyProfile, OTPVerification

admin.site.register(User)
admin.site.register(FarmerProfile)  
admin.site.register(CompanyProfile)
admin.site.register(OTPVerification)
