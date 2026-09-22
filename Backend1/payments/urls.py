from django.urls import path
from .views import PaymentSummaryView, EscrowAccountListView, FundEscrowView, ReleaseMilestoneView

urlpatterns = [
    path("summary/", PaymentSummaryView.as_view(), name="payment-summary"),
    path("accounts/", EscrowAccountListView.as_view(), name="escrow-accounts"),
    path("accounts/<int:account_id>/fund/", FundEscrowView.as_view(), name="fund-escrow"),
    path("milestones/<int:milestone_id>/release/", ReleaseMilestoneView.as_view(), name="release-milestone"),
]
