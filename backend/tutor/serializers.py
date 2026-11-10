
from rest_framework import serializers

from .models import Conversation, Message


class TutorRequestSerializer(serializers.Serializer):
    question = serializers.CharField(
        max_length=4000,
        trim_whitespace=True,
    )

    conversation_id = serializers.IntegerField(
        required=False,
        allow_null=True,
    )

    history = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list,
        max_length=20,
    )

    def validate_question(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Please enter a question."
            )

        return value


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            "id",
            "role",
            "content",
            "created_at",
        ]
        read_only_fields = fields


class ConversationSerializer(serializers.ModelSerializer):
    message_count = serializers.IntegerField(
        source="message_count_value",
        read_only=True,
        default=0,
    )

    class Meta:
        model = Conversation
        fields = [
            "id",
            "title",
            "message_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "message_count",
            "created_at",
            "updated_at",
        ]


class ConversationDetailSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Conversation
        fields = [
            "id",
            "title",
            "messages",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
