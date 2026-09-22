from django.contrib import admin
from .models import Dispute, DisputeEvidence
admin.site.register([Dispute, DisputeEvidence])
