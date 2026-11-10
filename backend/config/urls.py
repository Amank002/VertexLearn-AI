
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/tutor/", include("tutor.urls")),

    path("api/auth/", include("accounts.urls")),

    path("api/assignments/", include("assignments.urls")),
]
