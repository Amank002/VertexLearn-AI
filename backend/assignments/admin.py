
from django.contrib import admin

from .models import Assignment


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "title",
        "course",
        "user",
        "due_date",
        "priority",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "priority",
        "due_date",
    )

    search_fields = (
        "title",
        "course",
        "user__username",
        "user__email",
    )

    ordering = ("due_date",)
