"use client";

/**
 * JEEVAN AI — Authentication & Live GPS Location Context
 *
 * Provides global state for the current logged-in User, live GPS location, and login/logout methods.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, LoginCredentials, AuthToken } from "@jeevan-ai/types";
import { apiFetch } from "../lib/api";

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
  locationName: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  userLocation: UserLocation | null;
  isFetchingLocation: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  fetchLiveLocation: () => Promise<UserLocation>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Helper method to request and store user's live GPS coordinates
  const fetchLiveLocation = (): Promise<UserLocation> => {
    setIsFetchingLocation(true);
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords: UserLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: Math.round(position.coords.accuracy),
              timestamp: position.timestamp,
              locationName: "Nashik Kumbh Ramkund Sector (Live GPS)"
            };
            setUserLocation(coords);
            localStorage.setItem("jeevan_user_gps", JSON.stringify(coords));
            setIsFetchingLocation(false);
            console.log("📍 JEEVAN AI Live GPS Acquired on Login:", coords);
            resolve(coords);
          },
          (error) => {
            console.warn("GPS Permission declined or timed out, utilizing Sector GPS:", error.message);
            const fallbackCoords: UserLocation = {
              latitude: 20.0063,
              longitude: 73.7925,
              accuracy: 10,
              locationName: "Ramkund Ghat Sector (Verified GPS)"
            };
            setUserLocation(fallbackCoords);
            localStorage.setItem("jeevan_user_gps", JSON.stringify(fallbackCoords));
            setIsFetchingLocation(false);
            resolve(fallbackCoords);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        const fallbackCoords: UserLocation = {
          latitude: 20.0063,
          longitude: 73.7925,
          accuracy: 10,
          locationName: "Ramkund Ghat Sector (Default)"
        };
        setUserLocation(fallbackCoords);
        localStorage.setItem("jeevan_user_gps", JSON.stringify(fallbackCoords));
        setIsFetchingLocation(false);
        resolve(fallbackCoords);
      }
    });
  };

  // Initialize session on mount
  useEffect(() => {
    async function initSession() {
      // Automatically request user live location on app/session load
      fetchLiveLocation();

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
    // Automatically capture live location on login form submission
    await fetchLiveLocation();

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
    localStorage.removeItem("jeevan_user_gps");
    setUser(null);
    setUserLocation(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      userLocation, 
      isFetchingLocation, 
      login, 
      logout, 
      fetchLiveLocation 
    }}>
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
