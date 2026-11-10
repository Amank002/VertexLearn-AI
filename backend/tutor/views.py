
import logging

from django.conf import settings
from django.db.models import Count
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from groq import (
    Groq,
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    AuthenticationError,
    RateLimitError,
)

from .models import Conversation, Message
from .serializers import (
    TutorRequestSerializer,
    ConversationSerializer,
    ConversationDetailSerializer,
    MessageSerializer,
)


logger = logging.getLogger(__name__)


# =========================================================
# AI TUTOR INSTRUCTIONS
# =========================================================

TUTOR_INSTRUCTIONS = """
You are VertexLearn AI, a friendly and knowledgeable learning tutor.

Help learners understand programming, web development, data structures,
algorithms, databases, artificial intelligence, and academic subjects.

Guidelines:
- Explain concepts clearly and step by step.
- Adapt explanations to the learner's level.
- Give practical examples and code snippets when useful.
- Use readable Markdown formatting for longer answers.
- Use tables when comparing concepts.
- Encourage understanding instead of only giving final answers.
- If a question is ambiguous, ask a clarifying question.
- Never claim that you executed or tested code unless you actually did.
"""


# =========================================================
# GROQ CLIENT
# =========================================================

def get_groq_client():
    api_key = getattr(settings, "GROQ_API_KEY", "").strip()

    model = getattr(
        settings,
        "GROQ_MODEL",
        "openai/gpt-oss-120b",
    )

    if not api_key:
        return None, model

    client = Groq(
        api_key=api_key,
        timeout=45.0,
        max_retries=1,
    )

    return client, model


# =========================================================
# GROQ ERROR HANDLING
# =========================================================

def groq_error_response(exception):
    logger.exception(
        "Groq API request failed.",
        exc_info=exception,
    )

    if isinstance(exception, AuthenticationError):
        return Response(
            {
                "error": (
                    "Groq rejected the API key. "
                    "Check GROQ_API_KEY in backend/.env."
                )
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    if isinstance(exception, RateLimitError):
        return Response(
            {
                "error": (
                    "Groq usage limit reached. "
                    "Please try again later."
                )
            },
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    if isinstance(exception, APITimeoutError):
        return Response(
            {
                "error": "The AI tutor timed out. Please try again."
            },
            status=status.HTTP_504_GATEWAY_TIMEOUT,
        )

    if isinstance(exception, APIConnectionError):
        return Response(
            {
                "error": "Could not connect to the Groq AI service."
            },
            status=status.HTTP_502_BAD_GATEWAY,
        )

    if isinstance(exception, APIStatusError):
        return Response(
            {
                "error": (
                    "The AI service returned an error. "
                    "Check the Django terminal for details."
                )
            },
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response(
        {
            "error": "An unexpected AI service error occurred."
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


# =========================================================
# GENERATE AI ANSWER
# =========================================================

def create_ai_answer(conversation, question):
    try:
        client, model = get_groq_client()
    except Exception as exception:
        return None, None, groq_error_response(exception)

    if client is None:
        return None, None, Response(
            {
                "error": (
                    "The AI tutor is not configured. "
                    "Add GROQ_API_KEY to backend/.env."
                )
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    # Retrieve recent messages, excluding the latest
    # question because it is added separately below.
    history = list(
        conversation.messages
        .order_by("-created_at", "-id")[1:13]
    )

    history.reverse()

    messages = [
        {
            "role": "system",
            "content": TUTOR_INSTRUCTIONS,
        }
    ]

    messages.extend([
        {
            "role": message.role,
            "content": message.content,
        }
        for message in history
    ])

    messages.append({
        "role": "user",
        "content": question,
    })

    try:
        result = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.5,
            max_tokens=2000,
        )

        answer = (
            result.choices[0].message.content or ""
        ).strip()

        if not answer:
            return None, None, Response(
                {
                    "error": (
                        "The AI tutor returned an empty answer. "
                        "Please try again."
                    )
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return answer, model, None

    except Exception as exception:
        return None, None, groq_error_response(exception)


# =========================================================
# HEALTH CHECK
# =========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        "status": "ok",
        "service": "VertexLearn AI Tutor API",
    })


# =========================================================
# CONVERSATION LIST AND CREATE
# =========================================================

class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Conversation.objects
            .filter(user=self.request.user)
            .annotate(
                message_count_value=Count("messages")
            )
            .order_by("-updated_at")
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# =========================================================
# RETRIEVE, RENAME AND DELETE CONVERSATION
# =========================================================

class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_conversation(self, request, pk):
        return get_object_or_404(
            Conversation,
            pk=pk,
            user=request.user,
        )

    def get(self, request, pk):
        conversation = self.get_conversation(request, pk)

        serializer = ConversationDetailSerializer(
            conversation
        )

        return Response(serializer.data)

    def patch(self, request, pk):
        conversation = self.get_conversation(request, pk)

        serializer = ConversationSerializer(
            conversation,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def delete(self, request, pk):
        conversation = self.get_conversation(request, pk)

        conversation.delete()

        return Response(
            {"message": "Conversation deleted successfully."},
            status=status.HTTP_200_OK,
        )


# =========================================================
# SEND MESSAGE TO EXISTING CONVERSATION
# =========================================================

class ConversationChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        conversation = get_object_or_404(
            Conversation,
            pk=pk,
            user=request.user,
        )

        serializer = TutorRequestSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        question = serializer.validated_data["question"]

        # Save the user's question first.
        user_message = Message.objects.create(
            conversation=conversation,
            role="user",
            content=question,
        )

        # Generate the AI answer using saved conversation history.
        answer, model, error_response = create_ai_answer(
            conversation,
            question,
        )

        if error_response is not None:
            return error_response

        assistant_message = Message.objects.create(
            conversation=conversation,
            role="assistant",
            content=answer,
        )

        # Automatically create a title from the first question.
        if conversation.title == "New chat":
            conversation.title = question[:60]

        conversation.save()

        return Response(
            {
                "conversation_id": conversation.id,
                "answer": answer,
                "model": model,
                "user_message": MessageSerializer(
                    user_message
                ).data,
                "assistant_message": MessageSerializer(
                    assistant_message
                ).data,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# LEGACY CHAT ENDPOINT
# =========================================================

class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TutorRequestSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        question = serializer.validated_data["question"]
        conversation_id = serializer.validated_data.get(
            "conversation_id"
        )

        if conversation_id:
            conversation = get_object_or_404(
                Conversation,
                pk=conversation_id,
                user=request.user,
            )
        else:
            conversation = Conversation.objects.create(
                user=request.user,
                title=question[:60],
            )

        Message.objects.create(
            conversation=conversation,
            role="user",
            content=question,
        )

        answer, model, error_response = create_ai_answer(
            conversation,
            question,
        )

        if error_response is not None:
            return error_response

        assistant_message = Message.objects.create(
            conversation=conversation,
            role="assistant",
            content=answer,
        )

        conversation.save()

        return Response({
            "conversation_id": conversation.id,
            "answer": answer,
            "model": model,
            "message": MessageSerializer(
                assistant_message
            ).data,
        })
