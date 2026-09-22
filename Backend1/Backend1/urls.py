
from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('Accounts.urls')),
    path('api/farmer/', include('farmer.urls')),
    path('api/company/', include('company.urls')),
    path('api/contracts/', include('contracts.urls')),
    path('api/negotiations/', include('negotiations.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/monitoring/', include('monitoring.urls')),
    path('api/communications/', include('communications.urls')),
    path('api/disputes/', include('disputes.urls')),
    path('api/admin/', include('analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
