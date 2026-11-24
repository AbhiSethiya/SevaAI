import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import {
  setAuthToken,
  clearAuthToken,
  checkServerHealth,
} from "../lib/config";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);
  const navigate = useNavigate();

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log("Checking authentication status...");

      // First do a quick reachability check (with generous timeout for Render cold starts)
      const health = await checkServerHealth();
      setServerOnline(health.ok);
      if (!health.ok) {
        console.warn("Server unreachable:", health.error);
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await apiFetch("/auth/me", {
        method: "GET",
      });

      setServerOnline(true);
      console.log("Auth check response status:", response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log("User authenticated:", userData.user);
        setUser(userData.user);
      } else {
        if (response.status === 401) {
          clearAuthToken();
        }
        console.log("User not authenticated");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setServerOnline(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user is already logged in on app start and when server URL changes
  useEffect(() => {
    checkAuthStatus();
    const handleServerChange = () => {
      checkAuthStatus();
    };
    window.addEventListener("sevaai:server-url-changed", handleServerChange);
    return () => {
      window.removeEventListener("sevaai:server-url-changed", handleServerChange);
    };
  }, [checkAuthStatus]);

  const login = async (emailOrPhone, password) => {
    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ emailOrPhone, password }),
      });

      setServerOnline(true);
      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          setAuthToken(data.token);
        }
        setUser(data.user);
        setShowAuthModal(false);

        setTimeout(() => {
          if (data.user.role === "admin") {
            navigate("/dashboard", { replace: true });
          } else if (data.user.role === "worker") {
            navigate("/worker", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }, 50);

        return { success: true, user: data.user, message: data.message };
      } else {
        return { success: false, error: data.message, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      setServerOnline(false);
      return {
        success: false,
        error: "Cannot reach SevaAI server. Check Wi-Fi or Server Settings.",
        message: "Cannot reach SevaAI server. Check Wi-Fi or Server Settings.",
      };
    }
  };

  const register = async (username, password, additionalData = {}) => {
    try {
      const response = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
          ...additionalData,
        }),
      });

      setServerOnline(true);
      const data = await response.json();

      if (response.ok) {
        const loginResult = await login(
          additionalData.email || username,
          password
        );
        return loginResult;
      } else {
        return { success: false, error: data.message, message: data.message };
      }
    } catch (error) {
      console.error("Registration error:", error);
      setServerOnline(false);
      return {
        success: false,
        error: "Cannot reach SevaAI server. Check Wi-Fi or Server Settings.",
        message: "Cannot reach SevaAI server. Check Wi-Fi or Server Settings.",
      };
    }
  };

  const logout = async () => {
    try {
      const response = await apiFetch("/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        console.log("Logout successful");
      } else {
        console.error("Logout failed:", await response.text());
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthToken();
      setUser(null);
      setShowAuthModal(false);

      try {
        document.cookie.split(";").forEach(function (c) {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              "=;expires=" + new Date().toUTCString() + ";path=/"
            );
        });
      } catch (e) {
        console.log("Error clearing cookies:", e);
      }

      navigate("/", { replace: true });
    }
  };

  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);
  const openServerSettings = () => setShowServerSettings(true);
  const closeServerSettings = () => setShowServerSettings(false);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    showAuthModal,
    openAuthModal,
    closeAuthModal,
    serverOnline,
    showServerSettings,
    openServerSettings,
    closeServerSettings,
    refreshConnection: checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
