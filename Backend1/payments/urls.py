from django.urls import path
from .views import PaymentSummaryView, EscrowAccountListView, FundEscrowView, ReleaseMilestoneView, PayAdvanceView

urlpatterns = [
    path("summary/", PaymentSummaryView.as_view(), name="payment-summary"),
    path("accounts/", EscrowAccountListView.as_view(), name="escrow-accounts"),
    path("accounts/<int:account_id>/fund/", FundEscrowView.as_view(), name="fund-escrow"),
    path("contracts/<int:contract_id>/advance/", PayAdvanceView.as_view(), name="pay-advance"),
    path("milestones/<int:milestone_id>/release/", ReleaseMilestoneView.as_view(), name="release-milestone"),
]
