from django.contrib import admin
from . import models
# Register your models here.
admin.site.site_header = "AgriSure Admin"
admin.site.site_title = "AgriSure Admin Portal"
admin.site.register(models.Crop)