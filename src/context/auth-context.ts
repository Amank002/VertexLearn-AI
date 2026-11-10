import { createContext } from "react";
import type { User, ProfileUpdate } from "../services/authService";

export type AuthContextType = {
  user: User | null;
  loading: boolean;

  login: (username: string, password: string) => Promise<void>;

  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;

  logout: () => void;

  updateProfile: (profile: ProfileUpdate) => Promise<User>;
};

export const AuthContext = createContext<AuthContextType | null>(null);
