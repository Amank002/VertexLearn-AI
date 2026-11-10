import { useState } from "react";
import "./LearningPage.css";
import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  Filter,
  Play,
  Search,
  Target,
  TrendingUp,
} from "lucide-react";
import "./LearningPage.css";

type LearningCourse = {
  id: number;
  title: string;
  category: string;
  instructor: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  accent: "violet" | "blue" | "orange" | "green";
  icon: typeof Code2;
};

const initialCourses: LearningCourse[] = [
  {
    id: 1,
    title: "Full-Stack Web Development",
    category: "Development",
    instructor: "Alex Morgan",
    progress: 72,
    completedLessons: 18,
    totalLessons: 25,
    duration: "12h 30m",
    level: "Intermediate",
    accent: "violet",
    icon: Code2,
  },
  {
    id: 2,
    title: "Data Structures & Algorithms",
    category: "Computer Science",
    instructor: "Sarah Wilson",
    progress: 48,
    completedLessons: 12,
    totalLessons: 25,
    duration: "16h 10m",
    level: "Intermediate",
    accent: "blue",
    icon: Database,
  },
  {
    id: 3,
    title: "Machine Learning Fundamentals",
    category: "Artificial Intelligence",
    instructor: "David Chen",
    progress: 25,
    completedLessons: 5,
    totalLessons: 20,
    duration: "10h 45m",
    level: "Beginner",
    accent: "orange",
    icon: BrainCircuit,
  },
  {
    id: 4,
    title: "Python Programming Essentials",
    category: "Development",
    instructor: "Priya Sharma",
    progress: 100,
    completedLessons: 28,
    totalLessons: 28,
    duration: "9h 20m",
    level: "Beginner",
    accent: "green",
    icon: Code2,
  },
];

type StatusFilter = "All courses" | "In progress" | "Completed";

export default function LearningPage() {
  const [courses, setCourses] = useState(initialCourses);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All courses");
  const [level, setLevel] = useState("All levels");

  const completedCourses = courses.filter(
    (course) => course.progress === 100,
  ).length;

  const inProgressCourses = courses.filter(
    (course) => course.progress > 0 && course.progress < 100,
  ).length;

  const overallProgress =
    courses.length === 0
      ? 0
      : Math.round(
          courses.reduce((total, course) => total + course.progress, 0) /
            courses.length,
        );

  const query = search.trim().toLowerCase();

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      !query ||
      `${course.title} ${course.category} ${course.instructor}`
        .toLowerCase()
        .includes(query);

    const matchesStatus =
      status === "All courses" ||
      (status === "In progress" &&
        course.progress > 0 &&
        course.progress < 100) ||
      (status === "Completed" && course.progress === 100);

    const matchesLevel = level === "All levels" || course.level === level;

    return matchesSearch && matchesStatus && matchesLevel;
  });

  function continueCourse(courseId: number) {
    setCourses((current) =>
      current.map((course) => {
        if (course.id !== courseId || course.progress === 100) {
          return course;
        }

        const completedLessons = Math.min(
          course.completedLessons + 1,
          course.totalLessons,
        );

        const progress = Math.round(
          (completedLessons / course.totalLessons) * 100,
        );

        return {
          ...course,
          completedLessons,
          progress,
        };
      }),
    );
  }

  function resetFilters() {
    setSearch("");
    setStatus("All courses");
    setLevel("All levels");
  }

  return (
    <div className="learning-page">
      <section className="learning-heading">
        <div>
          <span className="learning-eyebrow">
            <BookOpen size={15} />
            YOUR LEARNING JOURNEY
          </span>

          <h1>My Learning</h1>

          <p>
            Keep making progress. Every lesson brings you closer to your goals.
          </p>
        </div>

        <div className="learning-heading-icon" aria-hidden="true">
          <BrainCircuit size={38} />
        </div>
      </section>

      <section className="learning-stats" aria-label="Learning statistics">
        <article className="learning-stat-card">
          <span className="learning-stat-icon learning-violet">
            <BookOpen size={20} />
          </span>

          <div>
            <span className="learning-stat-label">Enrolled courses</span>
            <strong>{courses.length.toString().padStart(2, "0")}</strong>
            <small>Courses in your library</small>
          </div>
        </article>

        <article className="learning-stat-card">
          <span className="learning-stat-icon learning-blue">
            <TrendingUp size={20} />
          </span>

          <div>
            <span className="learning-stat-label">In progress</span>
            <strong>{inProgressCourses.toString().padStart(2, "0")}</strong>
            <small>Courses you're working on</small>
          </div>
        </article>

        <article className="learning-stat-card">
          <span className="learning-stat-icon learning-green">
            <CheckCircle2 size={20} />
          </span>

          <div>
            <span className="learning-stat-label">Completed</span>
            <strong>{completedCourses.toString().padStart(2, "0")}</strong>
            <small>Finished courses</small>
          </div>
        </article>

        <article className="learning-stat-card">
          <span className="learning-stat-icon learning-orange">
            <Target size={20} />
          </span>

          <div>
            <span className="learning-stat-label">Overall progress</span>
            <strong>{overallProgress}%</strong>
            <small>Average course completion</small>
          </div>
        </article>
      </section>

      <section className="learning-overview">
        <div className="learning-overview-copy">
          <span className="learning-overview-label">
            <TrendingUp size={15} />
            YOUR MOMENTUM
          </span>

          <h2>You're building great habits.</h2>

          <p>Keep a steady pace and make time for one more lesson today.</p>

          <div className="learning-overview-progress">
            <div className="learning-overview-track">
              <div
                className="learning-overview-fill"
                style={{ width: `${overallProgress}%` }}
              />
            </div>

            <div className="learning-overview-progress-labels">
              <span>Average completion</span>
              <strong>{overallProgress}%</strong>
            </div>
          </div>
        </div>

        <div className="learning-overview-art" aria-hidden="true">
          <div className="learning-orbit learning-orbit-one" />
          <div className="learning-orbit learning-orbit-two" />

          <div className="learning-overview-art-icon">
            <Target size={42} />
          </div>
        </div>
      </section>

      <section className="learning-course-section">
        <div className="learning-section-heading">
          <div>
            <h2>Your courses</h2>
            <p>Pick up where you left off.</p>
          </div>

          <span className="learning-course-count">
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1 ? "course" : "courses"}
          </span>
        </div>

        <div className="learning-toolbar">
          <label className="learning-search">
            <Search size={18} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your courses..."
              aria-label="Search your courses"
            />
          </label>

          <label className="learning-filter">
            <Filter size={16} />

            <select
              aria-label="Filter by course status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as StatusFilter)
              }
            >
              <option>All courses</option>
              <option>In progress</option>
              <option>Completed</option>
            </select>
          </label>

          <label className="learning-filter">
            <select
              aria-label="Filter by difficulty"
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            >
              <option>All levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="learning-course-list">
            {filteredCourses.map((course) => {
              const Icon = course.icon;
              const completed = course.progress === 100;

              return (
                <article className="learning-course-card" key={course.id}>
                  <div
                    className={`learning-course-icon learning-course-${course.accent}`}
                  >
                    <Icon size={28} />
                  </div>

                  <div className="learning-course-details">
                    <div className="learning-course-tags">
                      <span>{course.category}</span>
                      <span
                        className={`learning-level learning-level-${course.level.toLowerCase()}`}
                      >
                        {course.level}
                      </span>
                    </div>

                    <h3>{course.title}</h3>

                    <p className="learning-instructor">
                      Instructor: <strong>{course.instructor}</strong>
                    </p>

                    <div
                      className="learning-progress-track"
                      role="progressbar"
                      aria-label={`${course.title} completion`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={course.progress}
                    >
                      <div
                        className={`learning-progress-fill learning-fill-${course.accent}`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>

                    <div className="learning-progress-labels">
                      <span>
                        {course.completedLessons} of {course.totalLessons}{" "}
                        lessons
                      </span>

                      <strong>{course.progress}%</strong>
                    </div>
                  </div>

                  <div className="learning-course-side">
                    <span className="learning-duration">
                      <Clock3 size={15} />
                      {course.duration}
                    </span>

                    {completed ? (
                      <span className="learning-completed-badge">
                        <CheckCircle2 size={15} />
                        Completed
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="learning-continue-button"
                        onClick={() => continueCourse(course.id)}
                      >
                        <Play size={15} fill="currentColor" />
                        Continue
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="learning-empty-state">
            <Search size={28} />

            <h3>No courses found</h3>

            <p>Try another search term or change your filters.</p>

            <button
              type="button"
              className="learning-reset-button"
              onClick={resetFilters}
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      <section className="learning-study-tip">
        <span className="learning-tip-icon">
          <BrainCircuit size={22} />
        </span>

        <div>
          <h3>Need help with a tricky concept?</h3>
          <p>
            Your AI tutor can help you work through questions and understand
            difficult topics.
          </p>
        </div>
      </section>

      <footer className="learning-footer">
        <span>© 2026 VertexLearn AI</span>
        <span>Progress over perfection.</span>
      </footer>
    </div>
  );
}
