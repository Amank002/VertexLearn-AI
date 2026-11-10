import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  FileText,
  Filter,
  Plus,
  Search,
  Target,
  Trash2,
  Trophy,
  RefreshCw,
  Pencil,
  X,
} from "lucide-react";

import "./AssignmentsPage.css";

import {
  assignmentService,
  type Assignment as ApiAssignment,
  type AssignmentPayload,
  type AssignmentPriority,
  type AssignmentStatus,
} from "../services/assignmentService";

// =========================================================
// TYPES
// =========================================================

type Assignment = {
  id: number;
  title: string;
  course: string;
  description: string;
  dueDate: string;
  priority: AssignmentPriority;
  status: AssignmentStatus;
};

type StatusFilter = "All" | "Pending" | "Completed";

type DeadlineStatus =
  | "Overdue"
  | "Due today"
  | "Due soon"
  | "Upcoming"
  | "Completed";

// =========================================================
// API DATA MAPPING
// =========================================================

function mapAssignment(item: ApiAssignment): Assignment {
  return {
    id: item.id,
    title: item.title,
    course: item.course,
    description: item.description,
    dueDate: item.due_date,
    priority: item.priority,
    status: item.status,
  };
}

// =========================================================
// DATE FORMATTING
// =========================================================

function formatDueDate(date: string): string {
  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// =========================================================
// DEADLINE TRACKING
// =========================================================

function getDeadlineStatus(
  dueDate: string,
  status: AssignmentStatus,
): DeadlineStatus {
  if (status === "Completed") {
    return "Completed";
  }

  const [year, month, day] = dueDate.split("-").map(Number);

  if (!year || !month || !day) {
    return "Upcoming";
  }

  // Use UTC calendar-day comparison to avoid DST/timezone
  // differences affecting the number of days remaining.
  const dueTimestamp = Date.UTC(year, month - 1, day);

  const now = new Date();

  const todayTimestamp = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const difference = Math.round((dueTimestamp - todayTimestamp) / 86_400_000);

  if (difference < 0) {
    return "Overdue";
  }

  if (difference === 0) {
    return "Due today";
  }

  if (difference <= 7) {
    return "Due soon";
  }

  return "Upcoming";
}

// =========================================================
// ERROR MESSAGE
// =========================================================

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

// =========================================================
// ASSIGNMENTS PAGE
// =========================================================

export default function AssignmentsPage() {
  // -------------------------------------------------------
  // STATE
  // -------------------------------------------------------

  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");

  const [retryCount, setRetryCount] = useState(0);

  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const [priorityFilter, setPriorityFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const [newPriority, setNewPriority] = useState<AssignmentPriority>("Medium");

  // -------------------------------------------------------
  // LOAD ASSIGNMENTS
  // -------------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    const fetchAssignments = async () => {
      try {
        const response = await assignmentService.getAll();

        if (isMounted) {
          setAssignments(response.map(mapAssignment));
          setPageError("");
        }
      } catch (error) {
        if (isMounted) {
          setPageError(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchAssignments();

    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  // -------------------------------------------------------
  // STATISTICS
  // -------------------------------------------------------

  const totalCount = assignments.length;

  const pendingCount = assignments.filter(
    (assignment) => assignment.status === "Pending",
  ).length;

  const completedCount = assignments.filter(
    (assignment) => assignment.status === "Completed",
  ).length;

  const completionRate =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // Deadline statistics
  const overdueCount = assignments.filter(
    (assignment) =>
      getDeadlineStatus(assignment.dueDate, assignment.status) === "Overdue",
  ).length;

  const dueTodayCount = assignments.filter(
    (assignment) =>
      getDeadlineStatus(assignment.dueDate, assignment.status) === "Due today",
  ).length;

  // -------------------------------------------------------
  // SEARCH AND FILTER
  // -------------------------------------------------------

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        `${assignment.title} ${assignment.course} ${assignment.description}`
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" || assignment.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || assignment.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [assignments, search, statusFilter, priorityFilter]);

  // -------------------------------------------------------
  // RESET FORM
  // -------------------------------------------------------

  function resetForm() {
    setNewTitle("");
    setNewCourse("");
    setNewDescription("");
    setNewDueDate("");
    setNewPriority("Medium");
    setEditingId(null);
  }

  // -------------------------------------------------------
  // OPEN EDIT FORM
  // -------------------------------------------------------

  function startEditing(assignment: Assignment) {
    setActionError("");

    setEditingId(assignment.id);

    setNewTitle(assignment.title);
    setNewCourse(assignment.course);
    setNewDescription(assignment.description);
    setNewDueDate(assignment.dueDate);
    setNewPriority(assignment.priority);

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // -------------------------------------------------------
  // CANCEL FORM
  // -------------------------------------------------------

  function cancelForm() {
    if (submitting) {
      return;
    }

    resetForm();
    setShowForm(false);
    setActionError("");
  }

  // -------------------------------------------------------
  // CREATE OR UPDATE ASSIGNMENT
  // -------------------------------------------------------

  async function addAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = newTitle.trim();
    const course = newCourse.trim();

    if (!title || !course || !newDueDate) {
      return;
    }

    const existingAssignment =
      editingId !== null
        ? assignments.find((item) => item.id === editingId)
        : undefined;

    if (editingId !== null && !existingAssignment) {
      setActionError("The assignment could not be found.");
      return;
    }

    const payload: AssignmentPayload = {
      title,
      course,
      description: newDescription.trim(),
      due_date: newDueDate,
      priority: newPriority,
      status: existingAssignment?.status ?? "Pending",
    };

    setSubmitting(true);
    setActionError("");

    try {
      if (editingId !== null) {
        const updated = await assignmentService.update(editingId, payload);

        setAssignments((current) =>
          current.map((item) =>
            item.id === editingId ? mapAssignment(updated) : item,
          ),
        );
      } else {
        const created = await assignmentService.create(payload);

        setAssignments((current) => [mapAssignment(created), ...current]);

        setStatusFilter("All");
        setPriorityFilter("All");
        setSearch("");
      }

      resetForm();
      setShowForm(false);
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  // -------------------------------------------------------
  // TOGGLE ASSIGNMENT STATUS
  // -------------------------------------------------------

  async function toggleAssignment(id: number) {
    const assignment = assignments.find((item) => item.id === id);

    if (!assignment || updatingIds.includes(id) || deletingIds.includes(id)) {
      return;
    }

    const newStatus: AssignmentStatus =
      assignment.status === "Completed" ? "Pending" : "Completed";

    setActionError("");
    setUpdatingIds((current) => [...current, id]);

    try {
      const updated = await assignmentService.update(id, {
        status: newStatus,
      });

      setAssignments((current) =>
        current.map((item) => (item.id === id ? mapAssignment(updated) : item)),
      );
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setUpdatingIds((current) => current.filter((itemId) => itemId !== id));
    }
  }

  // -------------------------------------------------------
  // DELETE ASSIGNMENT
  // -------------------------------------------------------

  async function deleteAssignment(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?",
    );

    if (!confirmed || deletingIds.includes(id)) {
      return;
    }

    setActionError("");
    setDeletingIds((current) => [...current, id]);

    try {
      await assignmentService.delete(id);

      setAssignments((current) =>
        current.filter((assignment) => assignment.id !== id),
      );

      if (editingId === id) {
        resetForm();
        setShowForm(false);
      }
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setDeletingIds((current) => current.filter((itemId) => itemId !== id));
    }
  }

  // -------------------------------------------------------
  // RESET FILTERS
  // -------------------------------------------------------

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setPriorityFilter("All");
  }

  // -------------------------------------------------------
  // RETRY LOADING
  // -------------------------------------------------------

  function retryLoading() {
    setLoading(true);
    setPageError("");
    setRetryCount((current) => current + 1);
  }

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------

  return (
    <main className="assignments-page">
      {/* PAGE HEADER */}

      <header className="assignments-header">
        <div>
          <span className="assignments-eyebrow">
            <Target size={15} />
            STAY FOCUSED, KEEP PROGRESSING
          </span>

          <h1>Assignments</h1>

          <p>
            Organize your tasks, manage deadlines, and celebrate your progress.
          </p>
        </div>

        <button
          type="button"
          className="assignments-add-button"
          onClick={() => {
            if (showForm) {
              cancelForm();
            } else {
              setActionError("");
              resetForm();
              setShowForm(true);
            }
          }}
          disabled={submitting}
        >
          {showForm ? <X size={17} /> : <Plus size={17} />}

          {showForm ? "Cancel" : "Add assignment"}
        </button>
      </header>

      {/* ERROR MESSAGE */}

      {(pageError || actionError) && (
        <div className="assignment-error" role="alert">
          <strong>Something went wrong</strong>

          <p>{pageError || actionError}</p>

          {pageError && (
            <button type="button" onClick={retryLoading} disabled={loading}>
              <RefreshCw size={13} />
              Try again
            </button>
          )}
        </div>
      )}

      {/* STATISTICS */}

      <section className="assignments-stats">
        <article className="assignments-stat-card">
          <span className="assignments-stat-icon stat-purple">
            <FileText size={21} />
          </span>

          <div>
            <span>Total assignments</span>
            <strong>{loading ? "—" : totalCount}</strong>
            <small>Tasks in your workspace</small>
          </div>
        </article>

        <article className="assignments-stat-card">
          <span className="assignments-stat-icon stat-orange">
            <Clock3 size={21} />
          </span>

          <div>
            <span>Pending</span>
            <strong>{loading ? "—" : pendingCount}</strong>
            <small>Tasks left to complete</small>
          </div>
        </article>

        <article className="assignments-stat-card">
          <span className="assignments-stat-icon stat-green">
            <CheckCircle2 size={21} />
          </span>

          <div>
            <span>Completed</span>
            <strong>{loading ? "—" : completedCount}</strong>
            <small>Tasks marked complete</small>
          </div>
        </article>

        <article className="assignments-stat-card">
          <span className="assignments-stat-icon stat-blue">
            <Trophy size={21} />
          </span>

          <div>
            <span>Completion rate</span>
            <strong>{loading ? "—" : `${completionRate}%`}</strong>
            <small>Of all listed assignments</small>
          </div>
        </article>
      </section>

      {/* DEADLINE SUMMARY */}

      {!loading && (
        <section className="assignment-deadline-summary">
          <div className="deadline-summary-item">
            <span className="deadline-summary-dot overdue-dot" />
            <div>
              <strong>{overdueCount}</strong>
              <span>Overdue</span>
            </div>
          </div>

          <div className="deadline-summary-item">
            <span className="deadline-summary-dot today-dot" />
            <div>
              <strong>{dueTodayCount}</strong>
              <span>Due today</span>
            </div>
          </div>
        </section>
      )}

      {/* CREATE / EDIT ASSIGNMENT FORM */}

      {showForm && (
        <section
          className="assignment-form-panel"
          aria-labelledby="assignment-form-title"
        >
          <div className="assignment-form-heading">
            <div>
              <h2 id="assignment-form-title">
                {editingId !== null
                  ? "Edit assignment"
                  : "Create an assignment"}
              </h2>

              <p>
                {editingId !== null
                  ? "Update your assignment details and save your changes."
                  : "Add a task to your personal learning checklist."}
              </p>
            </div>
          </div>

          <form className="assignment-form" onSubmit={addAssignment}>
            <label>
              Assignment title
              <input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="e.g. Build a portfolio website"
                maxLength={200}
                required
                disabled={submitting}
              />
            </label>

            <label>
              Course name
              <input
                value={newCourse}
                onChange={(event) => setNewCourse(event.target.value)}
                placeholder="e.g. Web Development"
                maxLength={200}
                required
                disabled={submitting}
              />
            </label>

            <label className="assignment-form-full">
              Description
              <textarea
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="What do you need to work on?"
                rows={3}
                disabled={submitting}
              />
            </label>

            <label>
              Due date
              <input
                type="date"
                value={newDueDate}
                onChange={(event) => setNewDueDate(event.target.value)}
                required
                disabled={submitting}
              />
            </label>

            <label>
              Priority
              <select
                value={newPriority}
                onChange={(event) =>
                  setNewPriority(event.target.value as AssignmentPriority)
                }
                disabled={submitting}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>

            <div className="assignment-form-actions assignment-form-full">
              <button
                type="button"
                className="assignment-cancel-button"
                onClick={cancelForm}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="assignments-add-button"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="assignment-loading-icon" />
                    {editingId !== null ? "Saving changes..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {editingId !== null ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Plus size={16} />
                    )}

                    {editingId !== null ? "Save changes" : "Create assignment"}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ASSIGNMENT LIST */}

      <section className="assignments-list-section">
        <div className="assignments-section-heading">
          <div>
            <h2>Your tasks</h2>
            <p>Track your learning activities in one place.</p>
          </div>

          <span className="assignments-count">
            {filteredAssignments.length}{" "}
            {filteredAssignments.length === 1 ? "task" : "tasks"}
          </span>
        </div>

        {/* SEARCH AND FILTERS */}

        <div className="assignments-toolbar">
          <label className="assignments-search">
            <Search size={17} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search assignments..."
              aria-label="Search assignments"
            />
          </label>

          <label className="assignments-filter">
            <Filter size={15} />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              aria-label="Filter by status"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </label>

          <label className="assignments-filter">
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              aria-label="Filter by priority"
            >
              <option value="All">All priorities</option>
              <option value="High">High priority</option>
              <option value="Medium">Medium priority</option>
              <option value="Low">Low priority</option>
            </select>
          </label>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="assignments-empty-state">
            <RefreshCw size={25} className="assignment-loading-icon" />

            <h3>Loading assignments...</h3>

            <p>Getting your assignments from the database.</p>
          </div>
        ) : filteredAssignments.length > 0 ? (
          <div className="assignments-list">
            {filteredAssignments.map((assignment) => {
              const isCompleted = assignment.status === "Completed";

              const isUpdating = updatingIds.includes(assignment.id);

              const isDeleting = deletingIds.includes(assignment.id);

              const isEditing = editingId === assignment.id;

              const deadlineStatus = getDeadlineStatus(
                assignment.dueDate,
                assignment.status,
              );

              const deadlineClass = deadlineStatus
                .toLowerCase()
                .replaceAll(" ", "-");

              return (
                <article
                  className={`assignment-card ${
                    isCompleted ? "assignment-is-completed" : ""
                  }`}
                  key={assignment.id}
                >
                  {/* COMPLETION BUTTON */}

                  <button
                    type="button"
                    className={`assignment-check ${
                      isCompleted ? "assignment-check-done" : ""
                    }`}
                    onClick={() => void toggleAssignment(assignment.id)}
                    disabled={isUpdating || isDeleting || isEditing}
                    aria-label={
                      isCompleted
                        ? `Mark ${assignment.title} as pending`
                        : `Mark ${assignment.title} as completed`
                    }
                    title={
                      isCompleted ? "Mark as pending" : "Mark as completed"
                    }
                  >
                    {isUpdating ? (
                      <RefreshCw
                        size={21}
                        className="assignment-loading-icon"
                      />
                    ) : isCompleted ? (
                      <CheckCircle2 size={23} />
                    ) : (
                      <Circle size={23} />
                    )}
                  </button>

                  {/* ASSIGNMENT DETAILS */}

                  <div className="assignment-details">
                    <div className="assignment-tags">
                      <span className="assignment-course-tag">
                        <BookOpen size={12} />
                        {assignment.course}
                      </span>

                      <span
                        className={`assignment-priority priority-${assignment.priority.toLowerCase()}`}
                      >
                        {assignment.priority}
                      </span>
                    </div>

                    <h3>{assignment.title}</h3>

                    <p>
                      {assignment.description || "No description provided."}
                    </p>

                    <div className="assignment-due-date">
                      <CalendarDays size={14} />

                      <span>Due {formatDueDate(assignment.dueDate)}</span>

                      <span
                        className={`assignment-deadline-badge deadline-${deadlineClass}`}
                      >
                        {deadlineStatus}
                      </span>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="assignment-actions">
                    <span
                      className={`assignment-status status-${assignment.status.toLowerCase()}`}
                    >
                      {assignment.status}
                    </span>

                    <button
                      type="button"
                      className="assignment-edit-button"
                      onClick={() => startEditing(assignment)}
                      disabled={isDeleting || isUpdating || submitting}
                      aria-label={`Edit ${assignment.title}`}
                      title="Edit assignment"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      className="assignment-delete-button"
                      onClick={() => void deleteAssignment(assignment.id)}
                      disabled={isDeleting || isUpdating}
                      aria-label={`Delete ${assignment.title}`}
                      title="Delete assignment"
                    >
                      {isDeleting ? (
                        <RefreshCw
                          size={16}
                          className="assignment-loading-icon"
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="assignments-empty-state">
            <span>
              <Search size={27} />
            </span>

            <h3>
              {assignments.length === 0
                ? "No assignments yet"
                : "No assignments found"}
            </h3>

            <p>
              {assignments.length === 0
                ? "Create your first assignment to start tracking your progress."
                : "Try changing your search or filters, or add a new assignment."}
            </p>

            <button
              type="button"
              className="assignment-cancel-button"
              onClick={() => {
                if (assignments.length === 0) {
                  resetForm();
                  setShowForm(true);
                } else {
                  resetFilters();
                }
              }}
            >
              {assignments.length === 0 ? "Create assignment" : "Reset filters"}
            </button>
          </div>
        )}
      </section>

      {/* LEARNING TIP */}

      <section className="assignments-tip">
        <span className="assignments-tip-icon">
          <Target size={22} />
        </span>

        <div>
          <h3>Make progress one task at a time</h3>

          <p>
            Break large tasks into smaller steps and mark each one complete when
            you're done.
          </p>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="assignments-footer">
        <span>© 2026 VertexLearn AI</span>
        <span>Small steps lead to big achievements.</span>
      </footer>
    </main>
  );
}
