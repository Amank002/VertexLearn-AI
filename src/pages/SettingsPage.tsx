import { useState, type FormEvent } from "react";

import {
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Globe,
  LockKeyhole,
  Moon,
  Palette,
  Save,
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
  Volume2,
} from "lucide-react";

import { useAuth } from "../context/useAuth";
import "./SettingsPage.css";

// SETTINGS TYPE
type Preferences = {
  fullName: string;
  email: string;
  bio: string;
  language: string;
  theme: "Light" | "Dark" | "System";
  courseUpdates: boolean;
  learningReminders: boolean;
  communityNotifications: boolean;
  weeklySummary: boolean;
};

const STORAGE_KEY = "vertexlearn-settings";

// DEFAULT LOCAL PREFERENCES
const defaultPreferences = {
  language: "English",
  theme: "Light" as const,
  courseUpdates: true,
  learningReminders: true,
  communityNotifications: false,
  weeklySummary: true,
};

// LOAD LOCAL PREFERENCES
function getSavedPreferences(
  fullName: string,
  email: string,
  bio: string,
): Preferences {
  const defaults: Preferences = {
    ...defaultPreferences,
    fullName,
    email,
    bio,
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return defaults;
    }

    const parsed = JSON.parse(saved) as Partial<Preferences>;

    return {
      ...defaults,

      // Profile information comes from Django.
      fullName,
      email,
      bio,

      // Other preferences come from browser storage.
      language:
        typeof parsed.language === "string"
          ? parsed.language
          : defaults.language,

      theme:
        parsed.theme === "Light" ||
        parsed.theme === "Dark" ||
        parsed.theme === "System"
          ? parsed.theme
          : defaults.theme,

      courseUpdates:
        typeof parsed.courseUpdates === "boolean"
          ? parsed.courseUpdates
          : defaults.courseUpdates,

      learningReminders:
        typeof parsed.learningReminders === "boolean"
          ? parsed.learningReminders
          : defaults.learningReminders,

      communityNotifications:
        typeof parsed.communityNotifications === "boolean"
          ? parsed.communityNotifications
          : defaults.communityNotifications,

      weeklySummary:
        typeof parsed.weeklySummary === "boolean"
          ? parsed.weeklySummary
          : defaults.weeklySummary,
    };
  } catch (error) {
    console.error("Unable to load settings:", error);
    return defaults;
  }
}

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();

  // INITIAL PROFILE VALUES FROM DJANGO
  const accountName = user?.full_name?.trim() || user?.username || "";

  const accountEmail = user?.email || "";
  const accountBio = user?.bio || "";

  // INITIALIZE SETTINGS
  const [preferences, setPreferences] = useState<Preferences>(() =>
    getSavedPreferences(accountName, accountEmail, accountBio),
  );

  const [savedMessage, setSavedMessage] = useState("");
  const [activeSection, setActiveSection] = useState("Profile");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // UPDATE PREFERENCE
  function updatePreference<K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));

    setSavedMessage("");
    setSaveError("");
  }

  // SAVE SETTINGS TO DJANGO AND LOCAL STORAGE
  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSavedMessage("");
    setSaveError("");

    if (!user) {
      setSaveError("Please sign in again to update your profile.");
      return;
    }

    setIsSaving(true);

    try {
      // Update profile in Django database.
      const updatedUser = await updateProfile({
        full_name: preferences.fullName.trim(),
        email: preferences.email.trim(),
        bio: preferences.bio.trim(),
      });

      // Store only local preferences in browser storage.
      const localPreferences = {
        language: preferences.language,
        theme: preferences.theme,
        courseUpdates: preferences.courseUpdates,
        learningReminders: preferences.learningReminders,
        communityNotifications: preferences.communityNotifications,
        weeklySummary: preferences.weeklySummary,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(localPreferences));

      // Synchronize the form with the updated backend response.
      setPreferences((current) => ({
        ...current,
        fullName: updatedUser.full_name || updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio || "",
      }));

      setSavedMessage(
        "Your profile and preferences have been saved successfully.",
      );
    } catch (error) {
      console.error("Profile update failed:", error);

      setSaveError(
        error instanceof Error
          ? error.message
          : "Unable to save your changes. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  // RESET LOCAL PREFERENCES
  function resetSettings() {
    setPreferences((current) => ({
      ...current,
      language: defaultPreferences.language,
      theme: defaultPreferences.theme,
      courseUpdates: defaultPreferences.courseUpdates,
      learningReminders: defaultPreferences.learningReminders,
      communityNotifications: defaultPreferences.communityNotifications,
      weeklySummary: defaultPreferences.weeklySummary,
    }));

    setSavedMessage("");
    setSaveError("");

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Unable to reset settings:", error);
      setSaveError("Unable to reset your local preferences.");
    }
  }

  // SETTINGS NAVIGATION
  const sections = [
    { label: "Profile", icon: UserRound },
    { label: "Notifications", icon: Bell },
    { label: "Appearance", icon: Palette },
    { label: "Language", icon: Globe },
    { label: "Privacy & security", icon: ShieldCheck },
  ];

  function navigateToSection(label: string) {
    setActiveSection(label);

    const sectionId = `settings-${label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}`;

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // PROFILE INITIALS
  const initials =
    preferences.fullName
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "VL";

  return (
    <main className="settings-page">
      {/* PAGE HEADER */}
      <header className="settings-header">
        <div>
          <span className="settings-eyebrow">
            <Settings size={15} />
            PERSONALIZE YOUR EXPERIENCE
          </span>

          <h1>Settings</h1>

          <p>Manage your profile, learning preferences, and notifications.</p>
        </div>
      </header>

      <div className="settings-layout">
        {/* SETTINGS SIDEBAR */}
        <aside className="settings-sidebar">
          <div className="settings-sidebar-heading">
            <span className="settings-avatar">{initials}</span>

            <div>
              <strong>{preferences.fullName || "Your profile"}</strong>

              <span>Learning account</span>
            </div>
          </div>

          {/* SETTINGS NAVIGATION */}
          <nav className="settings-nav" aria-label="Settings sections">
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <button
                  type="button"
                  key={section.label}
                  className={`settings-nav-item ${
                    activeSection === section.label ? "settings-nav-active" : ""
                  }`}
                  onClick={() => navigateToSection(section.label)}
                >
                  <Icon size={17} />

                  <span>{section.label}</span>

                  <ChevronRight size={15} />
                </button>
              );
            })}
          </nav>

          {/* HELP CARD */}
          <div className="settings-sidebar-help">
            <CircleHelp size={19} />

            <strong>Need help?</strong>

            <p>
              Review your preferences and choose the experience that suits you.
            </p>
          </div>
        </aside>

        {/* SETTINGS FORM */}
        <form className="settings-content" onSubmit={handleSave}>
          {/* PROFILE INFORMATION */}
          <section className="settings-panel" id="settings-profile">
            <div className="settings-panel-heading">
              <span className="settings-panel-icon settings-icon-purple">
                <UserRound size={19} />
              </span>

              <div>
                <h2>Profile information</h2>

                <p>Update the information displayed in your workspace.</p>
              </div>
            </div>

            <div className="settings-fields">
              <label>
                Full name
                <input
                  type="text"
                  value={preferences.fullName}
                  onChange={(event) =>
                    updatePreference("fullName", event.target.value)
                  }
                  placeholder="Enter your full name"
                  maxLength={150}
                  required
                />
              </label>

              <label>
                Email address
                <input
                  type="email"
                  value={preferences.email}
                  onChange={(event) =>
                    updatePreference("email", event.target.value)
                  }
                  placeholder="you@example.com"
                  maxLength={254}
                  required
                />
              </label>

              <label className="settings-field-full">
                About you
                <textarea
                  value={preferences.bio}
                  onChange={(event) =>
                    updatePreference("bio", event.target.value)
                  }
                  placeholder="Tell us about your learning goals"
                  rows={4}
                  maxLength={300}
                />
                <small>{preferences.bio.length}/300 characters</small>
              </label>
            </div>
          </section>

          {/* NOTIFICATIONS */}
          <section className="settings-panel" id="settings-notifications">
            <div className="settings-panel-heading">
              <span className="settings-panel-icon settings-icon-orange">
                <Bell size={19} />
              </span>

              <div>
                <h2>Notifications</h2>

                <p>Choose which learning updates you want to see.</p>
              </div>
            </div>

            <div className="settings-options">
              {/* COURSE UPDATES */}
              <label className="settings-option">
                <span className="settings-option-icon">
                  <BookOpen size={18} />
                </span>

                <span className="settings-option-copy">
                  <strong>Course updates</strong>

                  <small>
                    Updates about your courses and learning materials.
                  </small>
                </span>

                <input
                  type="checkbox"
                  checked={preferences.courseUpdates}
                  onChange={(event) =>
                    updatePreference("courseUpdates", event.target.checked)
                  }
                />
              </label>

              {/* LEARNING REMINDERS */}
              <label className="settings-option">
                <span className="settings-option-icon">
                  <Bell size={18} />
                </span>

                <span className="settings-option-copy">
                  <strong>Learning reminders</strong>

                  <small>Reminders to continue your learning activities.</small>
                </span>

                <input
                  type="checkbox"
                  checked={preferences.learningReminders}
                  onChange={(event) =>
                    updatePreference("learningReminders", event.target.checked)
                  }
                />
              </label>

              {/* COMMUNITY NOTIFICATIONS */}
              <label className="settings-option">
                <span className="settings-option-icon">
                  <Volume2 size={18} />
                </span>

                <span className="settings-option-copy">
                  <strong>Community notifications</strong>

                  <small>
                    Updates about discussions and community activity.
                  </small>
                </span>

                <input
                  type="checkbox"
                  checked={preferences.communityNotifications}
                  onChange={(event) =>
                    updatePreference(
                      "communityNotifications",
                      event.target.checked,
                    )
                  }
                />
              </label>

              {/* WEEKLY SUMMARY */}
              <label className="settings-option">
                <span className="settings-option-icon">
                  <Check size={18} />
                </span>

                <span className="settings-option-copy">
                  <strong>Weekly learning summary</strong>

                  <small>A weekly overview of your learning activity.</small>
                </span>

                <input
                  type="checkbox"
                  checked={preferences.weeklySummary}
                  onChange={(event) =>
                    updatePreference("weeklySummary", event.target.checked)
                  }
                />
              </label>
            </div>
          </section>

          {/* APPEARANCE */}
          <section className="settings-panel" id="settings-appearance">
            <div className="settings-panel-heading">
              <span className="settings-panel-icon settings-icon-blue">
                <Palette size={19} />
              </span>

              <div>
                <h2>Appearance</h2>

                <p>Choose your preferred visual theme.</p>
              </div>
            </div>

            <div className="settings-theme-options">
              {(
                [
                  {
                    value: "Light",
                    icon: Sun,
                    description: "Bright and clear",
                  },
                  {
                    value: "Dark",
                    icon: Moon,
                    description: "Comfortable in low light",
                  },
                  {
                    value: "System",
                    icon: Settings,
                    description: "Follow your device",
                  },
                ] as const
              ).map((theme) => {
                const Icon = theme.icon;

                return (
                  <button
                    type="button"
                    key={theme.value}
                    className={`settings-theme-card ${
                      preferences.theme === theme.value
                        ? "settings-theme-selected"
                        : ""
                    }`}
                    onClick={() => updatePreference("theme", theme.value)}
                    aria-pressed={preferences.theme === theme.value}
                  >
                    <Icon size={21} />

                    <strong>{theme.value}</strong>

                    <small>{theme.description}</small>

                    <span className="settings-theme-radio" />
                  </button>
                );
              })}
            </div>

            <p className="settings-theme-note">
              Your theme preference is saved on this device. Applying the theme
              throughout the application requires connecting it to the global
              theme system.
            </p>
          </section>

          {/* LANGUAGE */}
          <section className="settings-panel" id="settings-language">
            <div className="settings-panel-heading">
              <span className="settings-panel-icon settings-icon-green">
                <Globe size={19} />
              </span>

              <div>
                <h2>Language</h2>

                <p>Choose the language preference for your workspace.</p>
              </div>
            </div>

            <label className="settings-language-field">
              Display language
              <select
                value={preferences.language}
                onChange={(event) =>
                  updatePreference("language", event.target.value)
                }
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </label>

            <p className="settings-theme-note">
              Your language preference is saved. Translating the complete
              interface requires application-wide localization.
            </p>
          </section>

          {/* PRIVACY AND SECURITY */}
          <section className="settings-panel" id="settings-privacy-security">
            <div className="settings-panel-heading">
              <span className="settings-panel-icon settings-icon-purple">
                <ShieldCheck size={19} />
              </span>

              <div>
                <h2>Privacy & security</h2>

                <p>Understand how your preferences are stored.</p>
              </div>
            </div>

            <div className="settings-security-info">
              <LockKeyhole size={21} />

              <div>
                <strong>Account information protected</strong>

                <p>
                  Your profile information is saved in your authenticated Django
                  account. Your learning preferences are stored in this browser.
                </p>
              </div>
            </div>
          </section>

          {/* SAVE BAR */}
          <div className="settings-save-bar">
            <div className="settings-save-message" aria-live="polite">
              {savedMessage && (
                <>
                  <Check size={16} />

                  <span>{savedMessage}</span>
                </>
              )}

              {saveError && <span className="settings-error">{saveError}</span>}
            </div>

            <div className="settings-save-actions">
              <button
                type="button"
                className="settings-reset-button"
                onClick={resetSettings}
                disabled={isSaving}
              >
                Reset preferences
              </button>

              <button
                type="submit"
                className="settings-save-button"
                disabled={isSaving}
              >
                <Save size={16} />

                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* FOOTER */}
      <footer className="settings-footer">
        <span>© 2026 VertexLearn AI</span>

        <span>Your learning experience, your way.</span>
      </footer>
    </main>
  );
}
