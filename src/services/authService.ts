const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// USER TYPE
export type User = {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  bio?: string;
  is_staff: boolean;
};

// LOGIN TOKEN TYPE
export type TokenResponse = {
  access: string;
  refresh: string;
};

// PROFILE UPDATE TYPE
export type ProfileUpdate = {
  full_name?: string;
  email?: string;
  bio?: string;
};

// API REQUEST FUNCTION
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.detail ||
      data.email?.[0] ||
      data.full_name?.[0] ||
      data.bio?.[0] ||
      data.username?.[0] ||
      data.password?.[0] ||
      data.error ||
      "Something went wrong. Please try again.";

    throw new Error(message);
  }

  return data as T;
}

// AUTHENTICATION SERVICE
export const authService = {
  // REGISTER
  register(username: string, email: string, password: string) {
    return request<User>("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });
  },

  // LOGIN
  login(username: string, password: string) {
    return request<TokenResponse>("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
    });
  },

  // GET USER PROFILE
  getProfile(accessToken: string) {
    return request<User>("/api/auth/profile/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  // UPDATE USER PROFILE
  updateProfile(accessToken: string, profile: ProfileUpdate) {
    return request<User>("/api/auth/profile/", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(profile),
    });
  },

  // REFRESH ACCESS TOKEN
  refreshToken(refresh: string) {
    return request<{ access: string }>("/api/auth/refresh/", {
      method: "POST",
      body: JSON.stringify({ refresh }),
    });
  },
};
