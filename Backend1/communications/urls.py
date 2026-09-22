from django.urls import path
from .views import MessageListCreateView, NotificationListView, MarkNotificationReadView
urlpatterns = [path("notifications/", NotificationListView.as_view()), path("notifications/<int:pk>/read/", MarkNotificationReadView.as_view()), path("messages/", MessageListCreateView.as_view())]
