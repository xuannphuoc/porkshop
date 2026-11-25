import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthUser } from "./AuthContext";
import { requestApi } from "../utils/api";

interface AuthProviderProps { children: ReactNode; }

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    let isActive = true;
    async function loadUser() {
      try {
        const result = await requestApi<{ user: AuthUser | null }>("/api/auth/me");
        if (isActive) setUser(result.user);
      } catch {
        if (isActive) setUser(null);
      } finally {
        if (isActive) setLoading(false);
      }
    }
    void loadUser();
    return function () { isActive = false; };
  }, []);

  async function login(email: string, password: string): Promise<AuthUser> {
    const result = await requestApi<{ user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(result.user);
    return result.user;
  }

  async function register(fullName: string, email: string, password: string): Promise<AuthUser> {
    const result = await requestApi<{ user: AuthUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password }),
    });
    setUser(result.user);
    return result.user;
  }

  async function logout(): Promise<void> {
    await requestApi<{ success: boolean }>("/api/auth/logout", { method: "POST", body: "{}" });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
