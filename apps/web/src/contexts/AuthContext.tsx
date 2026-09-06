"use client";

/**
 * JEEVAN AI — Authentication Context
 *
 * Provides global state for the current logged-in User and login/logout methods.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, LoginCredentials, AuthToken } from "@jeevan-ai/types";
import { apiFetch } from "../lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    async function initSession() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await apiFetch<User>("/users/me");
        setUser(profile);
      } catch (error) {
        console.error("Session init failed:", error);
        localStorage.removeItem("access_token");
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    // OAuth2 expects form-encoded data
    const formData = new URLSearchParams();
    formData.append("username", credentials.email);
    formData.append("password", credentials.password);

    const tokenResponse = await apiFetch<AuthToken>("/auth/token", {
      method: "POST",
      body: formData,
      requireAuth: false,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    localStorage.setItem("access_token", tokenResponse.access_token);

    // Fetch user profile immediately after login
    const profile = await apiFetch<User>("/users/me");
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
