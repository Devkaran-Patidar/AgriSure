from django.contrib import admin
from .models import EscrowAccount, FundingTransaction, Milestone

admin.site.register([EscrowAccount, FundingTransaction, Milestone])
