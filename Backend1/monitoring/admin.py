from django.contrib import admin
from .models import CropUpdate, Inspection

admin.site.register([CropUpdate, Inspection])
