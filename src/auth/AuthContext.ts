import { createContext, useContext } from "react";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: "customer" | "admin";
}

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (fullName: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("AuthContext phải nằm trong AuthProvider.");
  }
  return context;
}
