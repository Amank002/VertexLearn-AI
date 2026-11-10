import { useCallback, useEffect, useState, type ReactNode } from "react";

import {
  authService,
  type User,
  type ProfileUpdate,
} from "../services/authService";

import { AuthContext } from "./auth-context";

const ACCESS_TOKEN_KEY = "vertexlearn_access";
const REFRESH_TOKEN_KEY = "vertexlearn_refresh";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // LOGOUT AND CLEAR SESSION
  const clearSession = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
  }, []);

  // GET A VALID ACCESS TOKEN
  const getValidAccessToken = useCallback(async (): Promise<string> => {
    let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!accessToken && !refreshToken) {
      throw new Error("You are not logged in. Please sign in again.");
    }

    if (!accessToken && refreshToken) {
      const result = await authService.refreshToken(refreshToken);

      accessToken = result.access;

      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }

    if (!accessToken) {
      throw new Error("Unable to retrieve your access token.");
    }

    return accessToken;
  }, []);

  // RESTORE USER SESSION
  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        if (!accessToken && !refreshToken) {
          return;
        }

        if (!accessToken && refreshToken) {
          const result = await authService.refreshToken(refreshToken);

          accessToken = result.access;

          localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        }

        if (accessToken) {
          const currentUser = await authService.getProfile(accessToken);

          if (active) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error("Session restoration failed:", error);

        if (active) {
          clearSession();
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, [clearSession]);

  // LOGIN
  const login = useCallback(
    async (username: string, password: string) => {
      const tokens = await authService.login(username, password);

      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);

      try {
        const currentUser = await authService.getProfile(tokens.access);

        setUser(currentUser);
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    [clearSession],
  );

  // REGISTER
  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const newUser = await authService.register(username, email, password);

      setUser(newUser);
    },
    [],
  );

  // UPDATE PROFILE IN DJANGO DATABASE
  const updateProfile = useCallback(
    async (profile: ProfileUpdate): Promise<User> => {
      const accessToken = await getValidAccessToken();

      try {
        const updatedUser = await authService.updateProfile(
          accessToken,
          profile,
        );

        setUser(updatedUser);

        return updatedUser;
      } catch (error) {
        // Retry once if the access token has expired.
        if (
          error instanceof Error &&
          error.message.toLowerCase().includes("token")
        ) {
          const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

          if (!refreshToken) {
            clearSession();
            throw error;
          }

          try {
            const result = await authService.refreshToken(refreshToken);

            localStorage.setItem(ACCESS_TOKEN_KEY, result.access);

            const updatedUser = await authService.updateProfile(
              result.access,
              profile,
            );

            setUser(updatedUser);

            return updatedUser;
          } catch (refreshError) {
            clearSession();
            throw refreshError;
          }
        }

        throw error;
      }
    },
    [getValidAccessToken, clearSession],
  );

  // LOGOUT
  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
