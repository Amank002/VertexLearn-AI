import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpDown,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  Filter,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import "./CatalogPage.css";

type Course = {
  id: number;
  title: string;
  category: string;
  instructor: string;
  description: string;
  lessons: number;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  rating: string;
  students: string;
  accent: "violet" | "blue" | "orange" | "green";
  icon: typeof Code2;
  featured?: boolean;
};

const courseData: Course[] = [
  {
    id: 1,
    title: "Full-Stack Web Development",
    category: "Development",
    instructor: "Alex Morgan",
    description:
      "Build responsive websites and full-stack applications with modern tools.",
    lessons: 25,
    duration: "12h 30m",
    level: "Intermediate",
    rating: "4.9",
    students: "2.4k",
    accent: "violet",
    icon: Code2,
    featured: true,
  },
  {
    id: 2,
    title: "Data Structures & Algorithms",
    category: "Computer Science",
    instructor: "Sarah Wilson",
    description:
      "Strengthen problem-solving skills and prepare for technical interviews.",
    lessons: 32,
    duration: "16h 10m",
    level: "Intermediate",
    rating: "4.8",
    students: "3.1k",
    accent: "blue",
    icon: Database,
  },
  {
    id: 3,
    title: "Machine Learning Fundamentals",
    category: "Artificial Intelligence",
    instructor: "David Chen",
    description:
      "Understand core ML concepts, model training, and practical use cases.",
    lessons: 20,
    duration: "10h 45m",
    level: "Beginner",
    rating: "4.9",
    students: "1.8k",
    accent: "orange",
    icon: BrainCircuit,
    featured: true,
  },
  {
    id: 4,
    title: "Python Programming Essentials",
    category: "Development",
    instructor: "Priya Sharma",
    description:
      "Learn Python fundamentals and write clean, reusable programs.",
    lessons: 28,
    duration: "9h 20m",
    level: "Beginner",
    rating: "4.7",
    students: "4.2k",
    accent: "green",
    icon: Code2,
  },
  {
    id: 5,
    title: "Generative AI in Practice",
    category: "Artificial Intelligence",
    instructor: "Jordan Lee",
    description:
      "Explore generative AI workflows, prompting, and responsible use.",
    lessons: 18,
    duration: "7h 50m",
    level: "Beginner",
    rating: "4.8",
    students: "1.6k",
    accent: "violet",
    icon: Sparkles,
  },
  {
    id: 6,
    title: "SQL & Database Design",
    category: "Data Science",
    instructor: "Morgan Patel",
    description:
      "Query data confidently and learn the foundations of relational design.",
    lessons: 22,
    duration: "8h 15m",
    level: "Intermediate",
    rating: "4.7",
    students: "2.0k",
    accent: "blue",
    icon: Database,
  },
];

const categories = [
  "All courses",
  "Development",
  "Computer Science",
  "Artificial Intelligence",
  "Data Science",
];

const levels = ["All levels", "Beginner", "Intermediate", "Advanced"];

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All courses");
  const [level, setLevel] = useState("All levels");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"recommended" | "rating" | "title">(
    "recommended",
  );
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([1, 2, 3]);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return courseData.filter((course) => {
      const matchesSearch =
        !query ||
        `${course.title} ${course.category} ${course.instructor} ${course.description}`
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "All courses" || course.category === category;

      const matchesLevel = level === "All levels" || course.level === level;

      const matchesFeatured = !featuredOnly || Boolean(course.featured);

      return (
        matchesSearch && matchesCategory && matchesLevel && matchesFeatured
      );
    });
  }, [search, category, level, featuredOnly]);

  const sortedCourses = useMemo(() => {
    const result = [...filteredCourses];

    if (sortBy === "rating") {
      result.sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [filteredCourses, sortBy]);

  function toggleEnrollment(courseId: number) {
    setEnrolledCourses((current) =>
      current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId],
    );
  }

  function resetFilters() {
    setSearch("");
    setCategory("All courses");
    setLevel("All levels");
    setFeaturedOnly(false);
    setSortBy("recommended");
  }

  return (
    <div className="catalog-page">
      <section className="catalog-intro">
        <div className="catalog-intro-copy">
          <div className="catalog-eyebrow">
            <Sparkles size={15} />
            LEARN SOMETHING NEW
          </div>

          <h1>Explore courses</h1>

          <p>
            Discover practical courses and build skills for what comes next.
          </p>
        </div>

        <div className="catalog-intro-art" aria-hidden="true">
          <div className="catalog-art-circle catalog-art-circle-one" />
          <div className="catalog-art-circle catalog-art-circle-two" />

          <div className="catalog-art-icon">
            <BookOpen size={40} />
          </div>

          <Sparkles className="catalog-art-sparkle" size={22} />
        </div>
      </section>

      <section className="catalog-summary" aria-label="Course catalog summary">
        <div className="catalog-summary-item">
          <span className="catalog-summary-icon summary-violet">
            <BookOpen size={19} />
          </span>

          <div>
            <strong>{courseData.length} courses</strong>
            <span>Curated learning paths</span>
          </div>
        </div>

        <div className="catalog-summary-item">
          <span className="catalog-summary-icon summary-blue">
            <BrainCircuit size={19} />
          </span>

          <div>
            <strong>AI-powered learning</strong>
            <span>Learn at your own pace</span>
          </div>
        </div>

        <div className="catalog-summary-item">
          <span className="catalog-summary-icon summary-green">
            <CheckCircle2 size={19} />
          </span>

          <div>
            <strong>Practical skills</strong>
            <span>Learn by doing</span>
          </div>
        </div>
      </section>

      <section
        className="catalog-toolbar"
        aria-label="Search and filter courses"
      >
        <label className="catalog-search">
          <Search size={18} />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search courses, topics, or instructors..."
            aria-label="Search courses, topics, or instructors"
          />

          {search && (
            <button
              type="button"
              className="catalog-clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </label>

        <label className="catalog-level-select">
          <span className="sr-only">Filter by difficulty</span>

          <Filter size={16} />

          <select
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          >
            {levels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="catalog-sort-select">
          <ArrowUpDown size={16} />
          <span className="sr-only">Sort courses</span>
          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target.value as "recommended" | "rating" | "title",
              )
            }
            aria-label="Sort courses"
          >
            <option value="recommended">Recommended</option>
            <option value="rating">Top rated</option>
            <option value="title">Course name (A–Z)</option>
          </select>
        </label>
      </section>

      <section className="catalog-category-row" aria-label="Course categories">
        <div className="catalog-category-tabs">
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              className={`catalog-category-tab ${
                category === item ? "is-selected" : ""
              }`}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <label className="catalog-featured-toggle">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(event) => setFeaturedOnly(event.target.checked)}
          />

          <span>Featured only</span>
        </label>
      </section>

      <section className="catalog-results">
        <div className="catalog-results-heading">
          <div>
            <h2>Find your next course</h2>

            <p>
              {sortedCourses.length}{" "}
              {sortedCourses.length === 1 ? "course" : "courses"} to explore
            </p>
          </div>

          {(search ||
            category !== "All courses" ||
            level !== "All levels" ||
            featuredOnly) && (
            <button
              type="button"
              className="catalog-reset-button"
              onClick={resetFilters}
            >
              Clear filters <X size={15} />
            </button>
          )}
        </div>

        {sortedCourses.length > 0 ? (
          <div className="catalog-course-grid">
            {sortedCourses.map((course) => {
              const Icon = course.icon;
              const enrolled = enrolledCourses.includes(course.id);

              return (
                <article className="catalog-course-card" key={course.id}>
                  <div
                    className={`catalog-course-cover cover-${course.accent}`}
                  >
                    <span className="catalog-course-category">
                      {course.category}
                    </span>

                    {course.featured && (
                      <span className="catalog-featured-badge">
                        <Sparkles size={12} />
                        Featured
                      </span>
                    )}

                    <div className="catalog-cover-art">
                      <Icon size={43} strokeWidth={1.5} />
                    </div>

                    <span className="catalog-cover-number">
                      {String(course.id).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="catalog-course-body">
                    <div className="catalog-course-rating">
                      <Star size={14} fill="currentColor" />
                      <strong>{course.rating}</strong>
                      <span>({course.students} learners)</span>
                    </div>

                    <h3>{course.title}</h3>

                    <p className="catalog-course-description">
                      {course.description}
                    </p>

                    <div className="catalog-course-instructor">
                      Instructor <strong>{course.instructor}</strong>
                    </div>

                    <div className="catalog-course-meta">
                      <span>
                        <BookOpen size={15} />
                        {course.lessons} lessons
                      </span>

                      <span>
                        <Clock3 size={15} />
                        {course.duration}
                      </span>
                    </div>

                    <div className="catalog-course-bottom">
                      <span
                        className={`catalog-level level-${course.level.toLowerCase()}`}
                      >
                        {course.level}
                      </span>

                      <button
                        type="button"
                        className={`catalog-enroll-button ${
                          enrolled ? "is-enrolled" : ""
                        }`}
                        onClick={() => toggleEnrollment(course.id)}
                        aria-pressed={enrolled}
                      >
                        {enrolled ? (
                          <>
                            <CheckCircle2 size={15} />
                            Enrolled
                          </>
                        ) : (
                          <>
                            Enroll now
                            <ArrowRight size={15} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="catalog-empty-state">
            <div className="catalog-empty-icon">
              <Search size={27} />
            </div>

            <h3>No courses found</h3>

            <p>Try a different search term or adjust your filters.</p>

            <button
              type="button"
              className="catalog-reset-button"
              onClick={resetFilters}
            >
              Reset filters <X size={15} />
            </button>
          </div>
        )}
      </section>

      <section className="catalog-bottom-cta">
        <div className="catalog-cta-icon">
          <BrainCircuit size={26} />
        </div>

        <div>
          <h2>Not sure where to start?</h2>
          <p>
            Explore a topic with your AI tutor and get help choosing your next
            learning step.
          </p>
        </div>

        <span className="catalog-cta-note">
          <Sparkles size={15} />
          Personalised learning
        </span>
      </section>

      <footer className="catalog-footer">
        <span>© 2026 VertexLearn AI</span>
        <span>Keep learning. Keep growing.</span>
      </footer>
    </div>
  );
}
