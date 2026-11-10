const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const ACCESS_TOKEN_KEY = "vertexlearn_access";

// ==========================================
// TYPES
// ==========================================

export type AssignmentPriority = "Low" | "Medium" | "High";

export type AssignmentStatus = "Pending" | "Completed";

export type Assignment = {
  id: number;
  title: string;
  course: string;
  description: string;
  due_date: string;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  created_at: string;
  updated_at: string;
};

export type AssignmentPayload = {
  title: string;
  course: string;
  description: string;
  due_date: string;
  priority: AssignmentPriority;
  status: AssignmentStatus;
};

// ==========================================
// API ERROR
// ==========================================

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.detail ||
      data.title?.[0] ||
      data.course?.[0] ||
      data.due_date?.[0] ||
      data.priority?.[0] ||
      data.status?.[0] ||
      data.error ||
      `Request failed (${response.status}).`;

    throw new Error(message);
  }

  return data as T;
}

// ==========================================
// REQUEST HELPER
// ==========================================

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!accessToken) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  return handleResponse<T>(response);
}

// ==========================================
// ASSIGNMENT SERVICE
// ==========================================

export const assignmentService = {
  // GET ALL ASSIGNMENTS
  getAll(): Promise<Assignment[]> {
    return request<Assignment[]>("/api/assignments/");
  },

  // CREATE ASSIGNMENT
  create(payload: AssignmentPayload): Promise<Assignment> {
    return request<Assignment>("/api/assignments/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // GET SINGLE ASSIGNMENT
  getById(id: number): Promise<Assignment> {
    return request<Assignment>(`/api/assignments/${id}/`);
  },

  // UPDATE ASSIGNMENT
  update(id: number, payload: Partial<AssignmentPayload>): Promise<Assignment> {
    return request<Assignment>(`/api/assignments/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // DELETE ASSIGNMENT
  delete(id: number): Promise<void> {
    return request<void>(`/api/assignments/${id}/`, {
      method: "DELETE",
    });
  },

  // TOGGLE COMPLETION
  toggleStatus(assignment: Assignment): Promise<Assignment> {
    const newStatus: AssignmentStatus =
      assignment.status === "Completed" ? "Pending" : "Completed";

    return request<Assignment>(`/api/assignments/${assignment.id}/`, {
      method: "PATCH",
      body: JSON.stringify({
        status: newStatus,
      }),
    });
  },
};
