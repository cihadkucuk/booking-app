"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "../lib/config";
import { AuthUser } from "../lib/types";

const TOKEN_KEY = "booking_token";
const USER_KEY = "booking_user";

type LoginInput = {
  email: string;
  password: string;
  studioSlug: string;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  ready: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
    const storedUser = window.localStorage.getItem(USER_KEY);
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as AuthUser);
      } catch {
        window.localStorage.removeItem(USER_KEY);
      }
    }
    setReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      ready,
      async login(input) {
        const response = await fetch(`${apiBaseUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-studio-slug": input.studioSlug
          },
          body: JSON.stringify({
            email: input.email,
            password: input.password
          })
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Login failed");
        }

        const data = (await response.json()) as { accessToken: string; user: AuthUser };
        setToken(data.accessToken);
        setUser(data.user);
        window.localStorage.setItem(TOKEN_KEY, data.accessToken);
        window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      },
      logout() {
        setToken(null);
        setUser(null);
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
      }
    }),
    [ready, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

