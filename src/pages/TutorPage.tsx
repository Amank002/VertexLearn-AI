import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { useLocation, useNavigate } from "react-router-dom";

import {
  Bot,
  Send,
  User,
  Sparkles,
  Plus,
  MessageSquare,
  BookOpen,
  Code2,
  Lightbulb,
  Pencil,
  Trash2,
  LoaderCircle,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useAuth } from "../context/useAuth";
import "./TutorPage.css";

// ==========================================
// CONFIGURATION
// ==========================================

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const ACCESS_TOKEN_KEY = "vertexlearn_access";
const REFRESH_TOKEN_KEY = "vertexlearn_refresh";

// ==========================================
// TYPES
// ==========================================

type Message = {
  id: number;
  role: "assistant" | "user";
  content: string;
  created_at?: string;
};

type Conversation = {
  id: number;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
};

type ConversationDetail = {
  id: number;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
};

type TutorNavigationState = {
  initialQuestion?: string;
  requestId?: number;
};

type ApiError = {
  error?: string;
  detail?: string;
  details?: unknown;
};

type TokenResponse = {
  access: string;
  refresh?: string;
};

// ==========================================
// AUTHENTICATED API HELPER
// ==========================================

async function getAccessToken(): Promise<string> {
  let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!accessToken && !refreshToken) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (!accessToken && refreshToken) {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as TokenResponse;

    if (!response.ok || !data.access) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);

      throw new Error("Unable to refresh your session. Please sign in again.");
    }

    accessToken = data.access;

    localStorage.setItem(ACCESS_TOKEN_KEY, data.access);

    if (data.refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
    }
  }

  if (!accessToken) {
    throw new Error("Authentication token is unavailable.");
  }

  return accessToken;
}

// ==========================================
// API REQUEST FUNCTION
// ==========================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  let accessToken = await getAccessToken();

  const makeRequest = (token: string) =>
    fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

  let response = await makeRequest(accessToken);

  // Retry once if the access token has expired.
  if (response.status === 401) {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    const refreshed = (await refreshResponse
      .json()
      .catch(() => ({}))) as TokenResponse;

    if (!refreshResponse.ok || !refreshed.access) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);

      throw new Error("Your session has expired. Please sign in again.");
    }

    accessToken = refreshed.access;

    localStorage.setItem(ACCESS_TOKEN_KEY, refreshed.access);

    if (refreshed.refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshed.refresh);
    }

    response = await makeRequest(accessToken);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorData = data as ApiError;

    throw new Error(
      errorData.error ||
        errorData.detail ||
        `Request failed (${response.status}).`,
    );
  }

  return data as T;
}

// ==========================================
// API SERVICE
// ==========================================

const tutorService = {
  getConversations() {
    return apiRequest<Conversation[]>("/api/tutor/conversations/");
  },

  createConversation(title = "New chat") {
    return apiRequest<Conversation>("/api/tutor/conversations/", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  },

  getConversation(id: number) {
    return apiRequest<ConversationDetail>(`/api/tutor/conversations/${id}/`);
  },

  renameConversation(id: number, title: string) {
    return apiRequest<Conversation>(`/api/tutor/conversations/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });
  },

  deleteConversation(id: number) {
    return apiRequest<{ message: string }>(`/api/tutor/conversations/${id}/`, {
      method: "DELETE",
    });
  },

  sendMessage(id: number, question: string) {
    return apiRequest<{
      answer: string;
      conversation: Conversation;
      user_message: Message;
      assistant_message: Message;
      model: string;
    }>(`/api/tutor/conversations/${id}/chat/`, {
      method: "POST",
      body: JSON.stringify({ question }),
    });
  },
};

// ==========================================
// DISPLAY NAME
// ==========================================

function getDisplayName(user: {
  username: string;
  email: string;
  full_name?: string;
}) {
  const name = user.full_name?.trim();

  if (name) return name;

  if (user.username.includes("@")) {
    return "Learner";
  }

  return user.username || "Learner";
}

// ==========================================
// WELCOME MESSAGE
// ==========================================

function createWelcomeMessage(name: string): Message {
  return {
    id: -1,
    role: "assistant",
    content: `Hi ${name}! 👋 I'm your AI learning assistant.

Ask me about programming, web development, data structures, artificial intelligence, or any topic you're studying.

Let's learn something new together!`,
  };
}

// ==========================================
// SUGGESTIONS
// ==========================================

const suggestions = [
  {
    icon: <Code2 size={19} />,
    title: "Explain a concept",
    prompt: "Explain React hooks with simple examples.",
  },
  {
    icon: <BookOpen size={19} />,
    title: "Help me study",
    prompt: "Create a study plan for learning data structures and algorithms.",
  },
  {
    icon: <Lightbulb size={19} />,
    title: "Practice a problem",
    prompt: "Give me a beginner-friendly JavaScript coding problem.",
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function TutorPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  const navigationState = location.state as TutorNavigationState | null;

  const displayName = user ? getDisplayName(user) : "Learner";

  // ========================================
  // STATE
  // ========================================

  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);

  const [messages, setMessages] = useState<Message[]>(() => [
    createWelcomeMessage(displayName),
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSwitchingChat, setIsSwitchingChat] = useState(false);
  const [error, setError] = useState("");

  // ========================================
  // REFS
  // ========================================

  const messagesRef = useRef<HTMLDivElement>(null);

  const processedRequestRef = useRef<number | null>(null);

  const requestSequenceRef = useRef(0);

  const isTypingRef = useRef(false);

  const activeConversationRef = useRef<number | null>(null);

  // ========================================
  // SELECT ACTIVE CONVERSATION
  // ========================================

  const selectConversation = useCallback(
    async (id: number) => {
      if (isTypingRef.current) return;

      const requestId = ++requestSequenceRef.current;

      activeConversationRef.current = id;

      setActiveConversationId(id);
      setIsSwitchingChat(true);
      setError("");
      setInput("");

      try {
        const conversation = await tutorService.getConversation(id);

        if (requestSequenceRef.current !== requestId) {
          return;
        }

        setMessages(
          conversation.messages.length > 0
            ? conversation.messages
            : [createWelcomeMessage(displayName)],
        );
      } catch (err) {
        if (requestSequenceRef.current !== requestId) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this conversation.",
        );
      } finally {
        if (requestSequenceRef.current === requestId) {
          setIsSwitchingChat(false);
        }
      }
    },
    [displayName],
  );

  // ========================================
  // LOAD CONVERSATION LIST
  // ========================================

  const loadConversations = useCallback(async () => {
    try {
      const items = await tutorService.getConversations();

      setConversations(items);

      if (items.length > 0) {
        await selectConversation(items[0].id);
      } else {
        activeConversationRef.current = null;

        setActiveConversationId(null);

        setMessages([createWelcomeMessage(displayName)]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conversation history.",
      );
    } finally {
      setIsLoadingHistory(false);
    }
  }, [displayName, selectConversation]);

  // ========================================
  // INITIALIZE CONVERSATION HISTORY
  // ========================================

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadConversations();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadConversations]);

  // ========================================
  // SCROLL TO LATEST MESSAGE
  // ========================================

  useEffect(() => {
    const container = messagesRef.current;

    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  // ========================================
  // CREATE NEW CONVERSATION
  // ========================================

  const startNewChat = useCallback(() => {
    if (isTypingRef.current) return;

    requestSequenceRef.current += 1;

    activeConversationRef.current = null;

    setActiveConversationId(null);
    setMessages([createWelcomeMessage(displayName)]);
    setInput("");
    setError("");
    setIsTyping(false);
    setIsSwitchingChat(false);
  }, [displayName]);

  // ========================================
  // SEND QUESTION
  // ========================================

  const submitQuestion = useCallback(async (rawQuestion: string) => {
    const question = rawQuestion.trim();

    if (!question || isTypingRef.current) return;

    isTypingRef.current = true;

    const requestId = ++requestSequenceRef.current;

    setIsTyping(true);
    setInput("");
    setError("");

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setMessages((current) => [...current, userMessage]);

    try {
      // Create a database conversation on the first question.
      let conversationId = activeConversationRef.current;

      if (conversationId === null) {
        const created = await tutorService.createConversation();

        if (requestSequenceRef.current !== requestId) {
          return;
        }

        conversationId = created.id;

        activeConversationRef.current = conversationId;

        setActiveConversationId(conversationId);

        setConversations((current) => [created, ...current]);
      }

      const result = await tutorService.sendMessage(conversationId, question);

      if (requestSequenceRef.current !== requestId) {
        return;
      }

      setMessages((current) => [...current, result.assistant_message]);

      setConversations((current) => {
        const existing = current.filter(
          (item) => item.id !== result.conversation.id,
        );

        return [result.conversation, ...existing].sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        );
      });
    } catch (err) {
      if (requestSequenceRef.current !== requestId) {
        return;
      }

      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";

      setError(message);

      // Refresh history because the backend may have saved
      // the user's question even if the AI response failed.
      try {
        const items = await tutorService.getConversations();

        if (requestSequenceRef.current === requestId) {
          setConversations(items);
        }
      } catch {
        // Keep the original request error visible.
      }
    } finally {
      if (requestSequenceRef.current === requestId) {
        isTypingRef.current = false;
        setIsTyping(false);
      }
    }
  }, []);

  // ========================================
  // FORM SUBMISSION
  // ========================================

  function sendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    void submitQuestion(input);
  }

  // ========================================
  // DASHBOARD QUESTION TRANSFER
  // ========================================

  useEffect(() => {
    const question = navigationState?.initialQuestion?.trim();

    const requestId = navigationState?.requestId;

    if (!question || requestId === undefined) return;

    if (processedRequestRef.current === requestId) {
      return;
    }

    processedRequestRef.current = requestId;

    // Start a separate conversation for a transferred question.
    startNewChat();

    void submitQuestion(question);

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [
    navigationState?.initialQuestion,
    navigationState?.requestId,
    location.pathname,
    navigate,
    startNewChat,
    submitQuestion,
  ]);

  // ========================================
  // RENAME CONVERSATION
  // ========================================

  async function renameChat(conversation: Conversation) {
    const newTitle = window.prompt(
      "Enter a new conversation title:",
      conversation.title,
    );

    if (newTitle === null) return;

    const title = newTitle.trim();

    if (!title || title === conversation.title) {
      return;
    }

    try {
      const updated = await tutorService.renameConversation(
        conversation.id,
        title,
      );

      setConversations((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to rename conversation.",
      );
    }
  }

  // ========================================
  // DELETE CONVERSATION
  // ========================================

  async function deleteChat(conversation: Conversation) {
    const confirmed = window.confirm(
      `Delete "${conversation.title}"? This will permanently delete its messages.`,
    );

    if (!confirmed) return;

    try {
      await tutorService.deleteConversation(conversation.id);

      const remaining = conversations.filter(
        (item) => item.id !== conversation.id,
      );

      setConversations(remaining);

      if (activeConversationId === conversation.id) {
        if (remaining.length > 0) {
          await selectConversation(remaining[0].id);
        } else {
          startNewChat();
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete conversation.",
      );
    }
  }

  // ========================================
  // SIGN OUT
  // ========================================

  function handleSignOut() {
    if (window.confirm("Are you sure you want to sign out?")) {
      logout();

      navigate("/login", {
        replace: true,
      });
    }
  }

  // ========================================
  // FORMAT DATE
  // ========================================

  function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <main className="tutor-page">
      {/* PAGE HEADER */}

      <header className="tutor-header">
        <div>
          <span className="tutor-eyebrow">
            <Sparkles size={15} />
            YOUR PERSONAL LEARNING COMPANION
          </span>

          <h1>AI Tutor</h1>

          <p>
            Welcome, {displayName}. Ask questions, explore concepts, and learn
            at your own pace.
          </p>
        </div>

        <button
          type="button"
          className="tutor-new-chat"
          onClick={startNewChat}
          disabled={isTyping}
        >
          <Plus size={17} />
          New chat
        </button>
      </header>

      {/* MAIN WORKSPACE */}

      <section className="tutor-workspace">
        {/* LEFT SIDEBAR */}

        <aside className="tutor-sidebar">
          <div className="tutor-sidebar-title">
            <MessageSquare size={17} />
            <h2>Learning assistant</h2>
          </div>

          <div className="tutor-status">
            <span className="tutor-status-dot" />
            AI tutor
          </div>

          <div className="tutor-sidebar-info">
            <span className="tutor-sidebar-info-icon">
              <BookOpen size={19} />
            </span>

            <h3>Learn by asking</h3>

            <p>
              Ask for explanations, examples, study plans, or coding practice.
            </p>
          </div>

          {/* CONVERSATION HISTORY */}

          <section className="tutor-history">
            <div className="tutor-history-heading">
              <h3>Recent conversations</h3>

              <span>{conversations.length}</span>
            </div>

            {isLoadingHistory ? (
              <div className="tutor-history-loading">
                <LoaderCircle size={16} className="tutor-spin" />
                Loading chats...
              </div>
            ) : conversations.length === 0 ? (
              <p className="tutor-history-empty">
                Your conversations will appear here.
              </p>
            ) : (
              <div className="tutor-history-list">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`tutor-history-item ${
                      activeConversationId === conversation.id
                        ? "tutor-history-active"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="tutor-history-select"
                      onClick={() => void selectConversation(conversation.id)}
                      disabled={isTyping || isSwitchingChat}
                    >
                      <MessageSquare size={15} />

                      <span className="tutor-history-text">
                        <strong title={conversation.title}>
                          {conversation.title}
                        </strong>

                        <small>{formatDate(conversation.updated_at)}</small>
                      </span>
                    </button>

                    <div className="tutor-history-actions">
                      <button
                        type="button"
                        title="Rename conversation"
                        aria-label={`Rename ${conversation.title}`}
                        onClick={() => void renameChat(conversation)}
                        disabled={isTyping}
                      >
                        <Pencil size={13} />
                      </button>

                      <button
                        type="button"
                        title="Delete conversation"
                        aria-label={`Delete ${conversation.title}`}
                        onClick={() => void deleteChat(conversation)}
                        disabled={isTyping}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* LEARNING TIP */}

          <div className="tutor-sidebar-tip">
            <Lightbulb size={18} />

            <p>
              <strong>Learning tip</strong>
              <br />
              Ask specific questions and request examples when a topic feels
              difficult.
            </p>
          </div>

          {user && (
            <button
              type="button"
              className="tutor-signout"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          )}
        </aside>

        {/* CHAT PANEL */}

        <section className="tutor-chat">
          {/* CHAT HEADER */}

          <div className="tutor-chat-heading">
            <span className="tutor-bot-avatar">
              <Bot size={22} />
            </span>

            <div>
              <h2>VertexLearn Assistant</h2>
              <p>Powered by your AI backend</p>
            </div>

            <span className="tutor-online-indicator">
              {isTyping ? "Thinking..." : "Ready"}
            </span>
          </div>

          {/* MESSAGES */}

          <div className="tutor-messages" ref={messagesRef} aria-live="polite">
            {isSwitchingChat ? (
              <div className="tutor-history-loading tutor-chat-loading">
                <LoaderCircle size={20} className="tutor-spin" />
                Loading conversation...
              </div>
            ) : (
              messages.map((message) => (
                <article
                  key={message.id}
                  className={`tutor-message tutor-message-${message.role}`}
                >
                  <span className="tutor-message-avatar">
                    {message.role === "assistant" ? (
                      <Bot size={18} />
                    ) : (
                      <User size={18} />
                    )}
                  </span>

                  <div className="tutor-message-body">
                    <span className="tutor-message-name">
                      {message.role === "assistant" ? "AI Tutor" : displayName}
                    </span>

                    <div
                      className={`tutor-message-content ${
                        message.role === "assistant"
                          ? "markdown-content"
                          : "plain-message"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ ...props }) => (
                              <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                              />
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}

            {/* TYPING INDICATOR */}

            {isTyping && (
              <div className="tutor-typing">
                <span className="tutor-typing-dots">
                  <i />
                  <i />
                  <i />
                </span>

                <p>AI Tutor is preparing your answer...</p>
              </div>
            )}
          </div>

          {/* ERROR MESSAGE */}

          {error && (
            <div className="tutor-error" role="alert">
              <strong>Something went wrong</strong>

              <p>{error}</p>

              {error.toLowerCase().includes("sign in") && (
                <button type="button" onClick={() => navigate("/login")}>
                  Sign in again
                </button>
              )}
            </div>
          )}

          {/* SUGGESTIONS */}

          {messages.length === 1 && !isSwitchingChat && (
            <div className="tutor-suggestions">
              <h3>What would you like to learn?</h3>

              <div className="tutor-suggestion-grid">
                {suggestions.map((suggestion) => (
                  <button
                    type="button"
                    className="tutor-suggestion-card"
                    key={suggestion.title}
                    onClick={() => setInput(suggestion.prompt)}
                    disabled={isTyping}
                  >
                    <span>{suggestion.icon}</span>

                    <strong>{suggestion.title}</strong>

                    <small>{suggestion.prompt}</small>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INPUT AREA */}

          <form className="tutor-input-area" onSubmit={sendMessage}>
            <div className="tutor-input-box">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask your learning question..."
                rows={2}
                aria-label="Your message"
                disabled={isTyping || isSwitchingChat}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
              />

              <button
                type="submit"
                className="tutor-send-button"
                disabled={!input.trim() || isTyping || isSwitchingChat}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>

            <p className="tutor-input-note">
              AI-generated answers may need verification. Keep practising and
              asking questions.
            </p>
          </form>
        </section>
      </section>

      {/* FOOTER */}

      <footer className="tutor-footer">
        <span>© 2026 VertexLearn AI</span>
        <span>Keep asking. Keep learning.</span>
      </footer>
    </main>
  );
}
