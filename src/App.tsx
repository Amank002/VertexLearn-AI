import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import CatalogPage from "./pages/CatalogPage";
import LearningPage from "./pages/LearningPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import CommunityPage from "./pages/CommunityPage";
import SettingsPage from "./pages/SettingsPage";
import SectionPage from "./pages/SectionPage";
import TutorPage from "./pages/TutorPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { useAuth } from "./context/useAuth";

import {
  Activity,
  ArrowRight,
  Bell,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Code2,
  Compass,
  Flame,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";

import "./App.css";

type Course = {
  id: number;
  title: string;
  category: string;
  instructor: string;
  progress: number;
  lessons: string;
  color: "violet" | "blue" | "orange";
  icon: typeof Code2;
};

const courses: Course[] = [
  {
    id: 1,
    title: "Full-Stack Web Development",
    category: "Development",
    instructor: "Alex Morgan",
    progress: 72,
    lessons: "18 of 25 lessons",
    color: "violet",
    icon: Code2,
  },
  {
    id: 2,
    title: "Data Structures & Algorithms",
    category: "Computer Science",
    instructor: "Sarah Wilson",
    progress: 48,
    lessons: "12 of 25 lessons",
    color: "blue",
    icon: BrainCircuit,
  },
  {
    id: 3,
    title: "Machine Learning Fundamentals",
    category: "Artificial Intelligence",
    instructor: "David Chen",
    progress: 25,
    lessons: "5 of 20 lessons",
    color: "orange",
    icon: Activity,
  },
];

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "My learning", icon: BookOpen },
  { label: "Explore courses", icon: Compass },
  { label: "AI tutor", icon: BrainCircuit },
  { label: "Assignments", icon: CheckCircle2 },
  { label: "Community", icon: MessageSquare },
];

const routeMap: Record<string, string> = {
  Overview: "/",
  "My learning": "/my-learning",
  "Explore courses": "/catalog",
  "AI tutor": "/tutor",
  Assignments: "/assignments",
  Community: "/community",
  Settings: "/settings",
};

const pageMap = Object.fromEntries(
  Object.entries(routeMap).map(([label, path]) => [path, label]),
) as Record<string, string>;

// Get a proper display name from the Django user profile.
function getDisplayName(user: {
  username: string;
  email: string;
  full_name?: string;
}) {
  const fullName = user.full_name?.trim();

  if (fullName) {
    return fullName;
  }

  // Never display an email address as a person's name.
  if (user.username.includes("@")) {
    return "Learner";
  }

  return user.username || "Learner";
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, loading, logout } = useAuth();

  // DISPLAY NAME
  const displayName = user ? getDisplayName(user) : "Learner";

  // AVATAR INITIALS
  const avatarInitials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "VL";

  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Keep the mobile drawer dismissible and prevent background scrolling.
  useEffect(() => {
    if (!mobileMenu) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenu(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenu]);

  const activeNav = pageMap[location.pathname] ?? "Overview";

  // COURSE SEARCH
  const visibleCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return courses;
    }

    return courses.filter((course) =>
      `${course.title} ${course.category} ${course.instructor}`
        .toLowerCase()
        .includes(query),
    );
  }, [search]);

  // WAIT FOR AUTHENTICATION STATUS
  if (loading) {
    return (
      <div className="auth-page">
        <p>Loading VertexLearn AI...</p>
      </div>
    );
  }

  // PUBLIC LOGIN AND REGISTRATION PAGES
  if (!user) {
    if (location.pathname === "/register") {
      return <RegisterPage />;
    }

    if (location.pathname === "/login") {
      return <LoginPage />;
    }

    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // PREVENT LOGGED-IN USERS FROM OPENING LOGIN PAGES
  if (location.pathname === "/login" || location.pathname === "/register") {
    return <Navigate to="/" replace />;
  }

  // NAVIGATION
  function goToPage(label: string) {
    const path = routeMap[label];

    if (!path) {
      return;
    }

    setMobileMenu(false);
    setNotificationsOpen(false);
    setProfileOpen(false);

    navigate(path);
  }

  // SEND DASHBOARD QUESTIONS TO AI TUTOR
  function askTutor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = question.trim();

    if (!text) {
      return;
    }

    setMessages((previous) => [...previous, text]);
    setQuestion("");
    setMobileMenu(false);
    setNotificationsOpen(false);
    setProfileOpen(false);

    navigate("/tutor", {
      state: {
        initialQuestion: text,
        requestId: Date.now(),
      },
    });
  }

  // SEARCH COURSES
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goToPage("Explore courses");
  }

  return (
    <div className="app-shell">
      {mobileMenu && (
        <button
          type="button"
          className="mobile-overlay"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        id="primary-sidebar"
        className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}
        aria-label="Primary navigation"
      >
        <div className="brand">
          <button
            type="button"
            className="brand-link"
            onClick={() => goToPage("Overview")}
            aria-label="Go to VertexLearn dashboard"
          >
            <span className="brand-mark">
              <GraduationCap size={25} />
            </span>

            <span className="brand-copy">
              <strong>VertexLearn</strong>
              <small>AI LEARNING PLATFORM</small>
            </span>
          </button>

          <button
            type="button"
            className="icon-button mobile-close"
            aria-label="Close menu"
            onClick={() => setMobileMenu(false)}
          >
            <X size={19} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className={`nav-link ${activeNav === label ? "nav-active" : ""}`}
              aria-current={activeNav === label ? "page" : undefined}
              onClick={() => goToPage(label)}
            >
              <Icon size={19} strokeWidth={1.8} />

              <span>{label}</span>

              {label === "AI tutor" && <span className="new-badge">AI</span>}
            </button>
          ))}
        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">
              <Sparkles size={20} />
            </div>

            <strong>Keep growing</strong>

            <p>Build a learning habit, one lesson at a time.</p>

            <button
              type="button"
              className="upgrade-link"
              onClick={() => goToPage("Explore courses")}
            >
              Explore courses <ArrowRight size={15} />
            </button>
          </div>

          <button
            type="button"
            className={`nav-link ${
              activeNav === "Settings" ? "nav-active" : ""
            }`}
            aria-current={activeNav === "Settings" ? "page" : undefined}
            onClick={() => goToPage("Settings")}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          {/* LOGGED-IN USER PROFILE */}
          <div className="profile">
            <div className="avatar" aria-hidden="true">
              {avatarInitials}
            </div>

            <div className="profile-info">
              <strong title={displayName}>{displayName}</strong>
              <span title={user.email}>{user.email}</span>
            </div>

            <button
              type="button"
              className="icon-button profile-toggle"
              aria-label={
                profileOpen ? "Close profile menu" : "Open profile menu"
              }
              aria-expanded={profileOpen}
              onClick={() => {
                setProfileOpen((open) => !open);
                setNotificationsOpen(false);
              }}
            >
              <ChevronDown
                size={17}
                className={profileOpen ? "profile-chevron-open" : ""}
              />
            </button>

            {/* PROFILE DROPDOWN */}
            {profileOpen && (
              <div className="profile-menu">
                <div className="profile-menu-header">
                  <div
                    className="avatar profile-menu-avatar"
                    aria-hidden="true"
                  >
                    {avatarInitials}
                  </div>

                  <div className="profile-menu-user">
                    <strong>{displayName}</strong>
                    <span>{user.email}</span>
                  </div>
                </div>

                <div className="profile-menu-divider" />

                <button type="button" onClick={() => goToPage("Settings")}>
                  <UserRound size={17} />
                  <span>Account settings</span>
                </button>

                <button
                  type="button"
                  className="profile-signout"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    navigate("/login", { replace: true });
                  }}
                >
                  <LogOut size={17} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="main-area">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="icon-button mobile-menu-button"
              aria-label="Open navigation"
              aria-expanded={mobileMenu}
              aria-controls="primary-sidebar"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={22} />
            </button>

            <div className="breadcrumb">
              <span>Workspace</span>
              <span className="breadcrumb-separator">/</span>
              <strong>{activeNav}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            {/* SEARCH */}
            <form className="search-box" onSubmit={handleSearch}>
              <Search size={18} />

              <input
                aria-label="Search courses"
                placeholder="Search your courses..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <button
                type="submit"
                className="search-submit"
                aria-label="View search results"
              >
                <kbd>Enter</kbd>
              </button>
            </form>

            {/* NOTIFICATIONS */}
            <div className="notification-wrapper">
              <button
                type="button"
                className="icon-button notification-button"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((open) => !open)}
              >
                <Bell size={20} />
                <span className="notification-dot" />
              </button>

              {notificationsOpen && (
                <div className="notification-menu">
                  <strong>Notifications</strong>

                  <p>You are all caught up.</p>

                  <span>New learning notifications will appear here.</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* DASHBOARD OVERVIEW */}
        {activeNav === "Overview" ? (
          <div className="page-content">
            {/* WELCOME SECTION */}
            <section className="welcome-row">
              <div>
                <div className="eyebrow">
                  <Sparkles size={15} />
                  YOUR LEARNING SPACE
                </div>

                <h1>
                  Good morning, {displayName} <span className="wave">✳</span>
                </h1>

                <p className="muted">
                  Small steps every day lead to remarkable progress.
                </p>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={() => goToPage("Explore courses")}
              >
                <Compass size={17} />
                Explore courses
              </button>
            </section>

            {/* HERO BANNER */}
            <section className="hero-banner">
              <div className="hero-copy">
                <span className="hero-tag">
                  <Sparkles size={14} />
                  YOUR PERSONAL AI LEARNING COMPANION
                </span>

                <h2>
                  Learn smarter.
                  <br />
                  Go further.
                </h2>

                <p>
                  Get unstuck, understand complex topics, and find your next
                  breakthrough with your AI learning companion.
                </p>

                <button
                  type="button"
                  className="hero-button"
                  onClick={() => goToPage("AI tutor")}
                >
                  Meet your AI tutor <ArrowRight size={17} />
                </button>
              </div>

              <div className="hero-art" aria-hidden="true">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />

                <div className="orbit-core">
                  <BrainCircuit size={68} strokeWidth={1.3} />

                  <Sparkles className="art-sparkle sparkle-one" size={24} />

                  <Sparkles className="art-sparkle sparkle-two" size={18} />
                </div>

                <div className="floating-chip chip-one">
                  <CheckCircle2 size={17} />
                  Learning progress
                </div>

                <div className="floating-chip chip-two">
                  <BrainCircuit size={17} />
                  AI powered
                </div>
              </div>
            </section>

            {/* STATISTICS */}
            <section className="stats-grid" aria-label="Learning statistics">
              <article className="stat-card">
                <div className="stat-top">
                  <span>Courses in progress</span>

                  <span className="stat-icon icon-violet">
                    <BookOpen size={19} />
                  </span>
                </div>

                <div className="stat-value">
                  03 <span>courses</span>
                </div>

                <div className="stat-foot">Keep building your skills</div>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>Learning hours</span>

                  <span className="stat-icon icon-blue">
                    <Clock3 size={19} />
                  </span>
                </div>

                <div className="stat-value">
                  28.5 <span>hours</span>
                </div>

                <div className="stat-foot positive">
                  <TrendingUp size={14} />
                  Your time invested in learning
                </div>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>Current streak</span>

                  <span className="stat-icon icon-orange">
                    <Flame size={19} />
                  </span>
                </div>

                <div className="stat-value">
                  07 <span>days</span>
                </div>

                <div className="stat-foot">Consistency builds mastery</div>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>Skills mastered</span>

                  <span className="stat-icon icon-green">
                    <Target size={19} />
                  </span>
                </div>

                <div className="stat-value">
                  12 <span>skills</span>
                </div>

                <div className="stat-foot">Keep up the momentum</div>
              </article>
            </section>

            {/* MAIN CONTENT GRID */}
            <div className="content-grid">
              {/* CONTINUE LEARNING */}
              <section className="panel courses-panel">
                <div className="section-heading">
                  <div>
                    <h2>Continue learning</h2>
                    <p>Pick up where you left off.</p>
                  </div>

                  <button
                    type="button"
                    className="text-button"
                    onClick={() => goToPage("My learning")}
                  >
                    View all <ArrowRight size={16} />
                  </button>
                </div>

                <div className="course-list">
                  {visibleCourses.length > 0 ? (
                    visibleCourses.map((course) => {
                      const Icon = course.icon;

                      return (
                        <article className="course-item" key={course.id}>
                          <div className={`course-icon course-${course.color}`}>
                            <Icon size={25} />
                          </div>

                          <div className="course-details">
                            <span className="course-category">
                              {course.category}
                            </span>

                            <h3>{course.title}</h3>

                            <p>{course.instructor}</p>

                            <div
                              className="progress-track"
                              role="progressbar"
                              aria-label={`${course.title} progress`}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={course.progress}
                            >
                              <div
                                className={`progress-fill fill-${course.color}`}
                                style={{
                                  width: `${course.progress}%`,
                                }}
                              />
                            </div>

                            <div className="progress-labels">
                              <span>{course.lessons}</span>
                              <strong>{course.progress}%</strong>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="course-arrow"
                            aria-label={`Continue ${course.title}`}
                            onClick={() => goToPage("My learning")}
                          >
                            <ArrowRight size={19} />
                          </button>
                        </article>
                      );
                    })
                  ) : (
                    <div className="empty-state">
                      <Search size={26} />

                      <strong>No matching courses</strong>

                      <span>Try another search term.</span>
                    </div>
                  )}
                </div>
              </section>

              {/* AI TUTOR */}
              <section className="panel tutor-panel">
                <div className="section-heading">
                  <div>
                    <h2>Ask your AI tutor</h2>

                    <p>Your learning companion, whenever you need it.</p>
                  </div>

                  <span
                    className="online-indicator"
                    title="AI tutor interface"
                  />
                </div>

                <div className="tutor-welcome">
                  <div className="tutor-avatar">
                    <BrainCircuit size={25} />
                  </div>

                  <div>
                    <strong>Hi, {displayName}! 👋</strong>

                    <p>What would you like to understand today?</p>
                  </div>
                </div>

                {/* SUGGESTED QUESTIONS */}
                <div className="suggestion-list">
                  {[
                    "Explain React hooks simply",
                    "Help me understand DSA",
                    "Create a study plan",
                  ].map((prompt) => (
                    <button
                      type="button"
                      key={prompt}
                      className="suggestion"
                      onClick={() => {
                        setQuestion(prompt);
                        setMobileMenu(false);
                        setNotificationsOpen(false);
                        setProfileOpen(false);

                        navigate("/tutor", {
                          state: {
                            initialQuestion: prompt,
                            requestId: Date.now(),
                          },
                        });
                      }}
                    >
                      <CircleHelp size={16} />

                      <span>{prompt}</span>

                      <ArrowRight size={15} />
                    </button>
                  ))}
                </div>

                {/* PREVIOUS DASHBOARD QUESTIONS */}
                {messages.length > 0 && (
                  <div className="submitted-questions">
                    <strong>Your questions</strong>

                    {messages.map((message, index) => (
                      <p key={`${message}-${index}`}>{message}</p>
                    ))}
                  </div>
                )}

                {/* ASK QUESTION FORM */}
                <form className="tutor-input" onSubmit={askTutor}>
                  <input
                    aria-label="Ask your tutor a question"
                    placeholder="Ask anything about your learning..."
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                  />

                  <button
                    type="submit"
                    aria-label="Submit question"
                    disabled={!question.trim()}
                  >
                    <ArrowRight size={19} />
                  </button>
                </form>

                <div className="privacy-note">
                  <Sparkles size={13} />
                  AI responses may need verification.
                </div>
              </section>
            </div>

            {/* FOOTER */}
            <footer className="page-footer">
              <span>© 2026 VertexLearn AI</span>

              <span>Designed for curious minds.</span>
            </footer>
          </div>
        ) : activeNav === "AI tutor" ? (
          <TutorPage />
        ) : activeNav === "Explore courses" ? (
          <CatalogPage />
        ) : activeNav === "My learning" ? (
          <LearningPage />
        ) : activeNav === "Assignments" ? (
          <AssignmentsPage />
        ) : activeNav === "Community" ? (
          <CommunityPage />
        ) : activeNav === "Settings" ? (
          <SettingsPage />
        ) : (
          <SectionPage title={activeNav} />
        )}
      </main>
    </div>
  );
}
