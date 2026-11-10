
from rest_framework import serializers

from .models import Assignment


class AssignmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Assignment

        fields = [
            "id",
            "title",
            "course",
            "description",
            "due_date",
            "priority",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_title(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Assignment title is required."
            )

        return value

    def validate_course(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Course name is required."
            )

        return value
