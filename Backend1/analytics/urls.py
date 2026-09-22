from django.urls import path
from .views import AdminContractsView, AdminDisputesView, AdminPaymentsView, AdminSummaryView, UserListView
urlpatterns = [path("summary/", AdminSummaryView.as_view()), path("users/", UserListView.as_view()), path("contracts/", AdminContractsView.as_view()), path("payments/", AdminPaymentsView.as_view()), path("disputes/", AdminDisputesView.as_view())]
