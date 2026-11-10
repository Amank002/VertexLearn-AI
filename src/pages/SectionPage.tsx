import { useNavigate } from "react-router-dom";
import "./SectionPage.css";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  MessageSquare,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  CircleHelp,
} from "lucide-react";
import "./SectionPage.css";

type SectionPageProps = {
  title: string;
};

type SectionItem = {
  title: string;
  description: string;
  icon: typeof BookOpen;
  action: string;
  badge: string;
};

type SectionContent = {
  eyebrow: string;
  heading: string;
  description: string;
  icon: typeof BookOpen;
  items: SectionItem[];
};

const sectionContent: Record<string, SectionContent> = {
  Assignments: {
    eyebrow: "YOUR TASKS",
    heading: "Assignments",
    description:
      "Stay organized, track your learning activities, and keep moving toward your goals.",
    icon: FileText,
    items: [
      {
        title: "Review your course lessons",
        description:
          "Revisit the lessons you're currently studying and strengthen your understanding.",
        icon: BookOpen,
        action: "Review lessons",
        badge: "Learning",
      },
      {
        title: "Practice coding problems",
        description:
          "Build problem-solving skills through regular programming practice.",
        icon: GraduationCap,
        action: "Start practice",
        badge: "Practice",
      },
      {
        title: "Check your learning progress",
        description:
          "Review your completed lessons and see how far you've progressed.",
        icon: CheckCircle2,
        action: "View progress",
        badge: "Progress",
      },
    ],
  },

  Community: {
    eyebrow: "LEARN TOGETHER",
    heading: "Community",
    description:
      "Connect with fellow learners, exchange ideas, and grow your skills together.",
    icon: Users,
    items: [
      {
        title: "Share what you're learning",
        description:
          "Explore ways to discuss new concepts and share your learning journey.",
        icon: MessageSquare,
        action: "Explore discussions",
        badge: "Discussion",
      },
      {
        title: "Ask a learning question",
        description:
          "Get help preparing questions about topics you want to understand.",
        icon: CircleHelp,
        action: "Ask your tutor",
        badge: "Questions",
      },
      {
        title: "Celebrate your progress",
        description:
          "Review your learning milestones and keep building momentum.",
        icon: Sparkles,
        action: "View learning",
        badge: "Milestones",
      },
    ],
  },

  Settings: {
    eyebrow: "YOUR PREFERENCES",
    heading: "Settings",
    description:
      "Review your learning experience and manage your account preferences.",
    icon: Settings,
    items: [
      {
        title: "Learning preferences",
        description: "Review your learning goals and course preferences.",
        icon: GraduationCap,
        action: "Review preferences",
        badge: "Learning",
      },
      {
        title: "Notification preferences",
        description:
          "Review the notification options available in your workspace.",
        icon: Bell,
        action: "Review notifications",
        badge: "Notifications",
      },
      {
        title: "Privacy and security",
        description:
          "Review important considerations for account privacy and security.",
        icon: ShieldCheck,
        action: "Review security",
        badge: "Account",
      },
    ],
  },
};

const defaultContent: SectionContent = {
  eyebrow: "YOUR LEARNING SPACE",
  heading: "Coming soon",
  description: "We're preparing more tools to support your learning journey.",
  icon: Sparkles,
  items: [
    {
      title: "Continue learning",
      description: "Pick up where you left off in your current courses.",
      icon: BookOpen,
      action: "View learning",
      badge: "Learning",
    },
    {
      title: "Explore new courses",
      description: "Discover courses and topics to study next.",
      icon: GraduationCap,
      action: "Explore courses",
      badge: "Explore",
    },
    {
      title: "Meet your AI tutor",
      description: "Get help understanding challenging learning concepts.",
      icon: Sparkles,
      action: "Ask your tutor",
      badge: "AI Tutor",
    },
  ],
};

const routeMap: Record<string, string> = {
  "Review lessons": "/my-learning",
  "Start practice": "/catalog",
  "View progress": "/my-learning",
  "Explore discussions": "/community",
  "Ask your tutor": "/tutor",
  "View learning": "/my-learning",
  "Review preferences": "/settings",
  "Review notifications": "/settings",
  "Review security": "/settings",
  "Explore courses": "/catalog",
};

export default function SectionPage({ title }: SectionPageProps) {
  const navigate = useNavigate();

  const content = sectionContent[title] ?? {
    ...defaultContent,
    heading: title,
  };

  const PageIcon = content.icon;

  function handleAction(action: string) {
    const route = routeMap[action];

    if (route) {
      navigate(route);
    }
  }

  return (
    <div className="section-page">
      {/* Page header */}
      <section className="section-page-hero">
        <div className="section-page-copy">
          <span className="section-page-eyebrow">
            <Sparkles size={14} />
            {content.eyebrow}
          </span>

          <h1>{content.heading}</h1>

          <p>{content.description}</p>
        </div>

        <div className="section-page-hero-icon" aria-hidden="true">
          <PageIcon size={40} strokeWidth={1.5} />
        </div>
      </section>

      {/* Section introduction */}
      <section className="section-page-intro">
        <div>
          <span className="section-page-intro-icon">
            <Clock3 size={19} />
          </span>

          <div>
            <h2>Your next steps</h2>
            <p>Choose an option to continue your learning journey.</p>
          </div>
        </div>
      </section>

      {/* Action cards */}
      <section className="section-page-grid">
        {content.items.map((item) => {
          const ItemIcon = item.icon;

          return (
            <article className="section-page-card" key={item.title}>
              <div className="section-page-card-top">
                <span className="section-page-card-icon">
                  <ItemIcon size={22} />
                </span>

                <span className="section-page-badge">{item.badge}</span>
              </div>

              <h3>{item.title}</h3>

              <p>{item.description}</p>

              <button
                type="button"
                className="section-page-action"
                onClick={() => handleAction(item.action)}
              >
                {item.action}
                <ArrowRight size={16} />
              </button>
            </article>
          );
        })}
      </section>

      {/* Learning reminder */}
      <section className="section-page-note">
        <span className="section-page-note-icon">
          <Sparkles size={21} />
        </span>

        <div>
          <h2>Keep building your skills</h2>

          <p>
            Consistent learning helps you build confidence and make steady
            progress toward your goals.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-page-footer">
        <span>© 2026 VertexLearn AI</span>
        <span>Learn something new every day.</span>
      </footer>
    </div>
  );
}
