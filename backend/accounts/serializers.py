from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Profile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(
        write_only=True,
        required=False,
        max_length=150,
    )

    bio = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        max_length=300,
    )

    
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "full_name",
            "bio",
            "is_staff",
        ]
        read_only_fields = [
            "id",
            "username",
            "is_staff",
        ]


    def validate_email(self, value):
        value = value.strip().lower()

        existing_users = User.objects.filter(
            email__iexact=value
        ).exclude(pk=self.instance.pk)

        if existing_users.exists():
            raise serializers.ValidationError(
                "This email address is already being used."
            )

        return value

    def update(self, instance, validated_data):
        full_name = validated_data.pop("full_name", None)
        bio = validated_data.pop("bio", None)

        # Update email.
        if "email" in validated_data:
            instance.email = validated_data["email"]

        # Update first and last name.
        if full_name is not None:
            name_parts = full_name.strip().split(maxsplit=1)

            instance.first_name = name_parts[0] if name_parts else ""
            instance.last_name = (
                name_parts[1] if len(name_parts) > 1 else ""
            )

        instance.save()

        # Create or retrieve the user's profile.
        profile, created = Profile.objects.get_or_create(
            user=instance
        )

        # Update biography.
        if bio is not None:
            profile.bio = bio
            profile.save()

        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)

        profile, created = Profile.objects.get_or_create(
            user=instance
        )

        full_name = (
            f"{instance.first_name} {instance.last_name}"
        ).strip()

        data["full_name"] = full_name or instance.username
        data["bio"] = profile.bio

        return data