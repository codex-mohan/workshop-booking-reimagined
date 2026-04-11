from django.urls import path, include
from django.conf.urls.static import static
from django.contrib import admin
from workshop_portal import views
from django.conf import settings

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.index),
    path("workshop/", include("workshop_app.urls")),
    path("reset/", include("django.contrib.auth.urls")),
    path("page/", include("cms.urls")),
    path("statistics/", include("statistics_app.urls")),
    path("api/", include("api.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
