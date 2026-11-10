
from django.urls import path

from .views import (
    health_check,
    ChatView,
    ConversationListCreateView,
    ConversationDetailView,
    ConversationChatView,
)

urlpatterns = [
    path(
        "health/",
        health_check,
        name="health-check",
    ),

    # Chat compatibility endpoint
    path(
        "chat/",
        ChatView.as_view(),
        name="tutor-chat",
    ),

    # Conversation list and creation
    path(
        "conversations/",
        ConversationListCreateView.as_view(),
        name="conversation-list-create",
    ),

    # Retrieve, rename, and delete a conversation
    path(
        "conversations/<int:pk>/",
        ConversationDetailView.as_view(),
        name="conversation-detail",
    ),

    # Send a message to an existing conversation
    path(
        "conversations/<int:pk>/chat/",
        ConversationChatView.as_view(),
        name="conversation-chat",
    ),
]
