import React, { createContext, useContext, useState, useEffect } from "react";

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

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log("Checking authentication status...");
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      console.log("Auth check response status:", response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log("User authenticated:", userData.user);
        setUser(userData.user); // Make sure to access the user property
      } else {
        // Clear any stale user data if not authenticated
        console.log("User not authenticated");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null); // Clear user on error
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrPhone, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ emailOrPhone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setShowAuthModal(false); // Close auth modal on successful login

        // Redirect based on user role
        setTimeout(() => {
          if (data.user.role === "admin") {
            window.location.href = "/dashboard";
          } else if (data.user.role === "worker") {
            window.location.href = "/worker";
          } else {
            // For regular users, stay on current page or go to home
            window.location.href = "/";
          }
        }, 100);

        return { success: true, user: data.user, message: data.message };
      } else {
        return { success: false, error: data.message, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Network error occurred. Please check your connection.",
        message: "Network error occurred. Please check your connection.",
      };
    }
  };

  const register = async (username, password, additionalData = {}) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
          ...additionalData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // After successful registration, we need to login using email
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
      return {
        success: false,
        error: "Network error occurred. Please check your connection.",
        message: "Network error occurred. Please check your connection.",
      };
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST", // Changed to POST to match backend route
        credentials: "include",
      });

      if (response.ok) {
        console.log("Logout successful");
      } else {
        console.error("Logout failed:", await response.text());
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear user state regardless of server response
      setUser(null);
      setShowAuthModal(false);

      // Clear any potential cached authentication data
      try {
        // Clear all cookies by setting them to expire
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

      // Force reload to clear any cached state and ensure fresh start
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    }
  };

  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    showAuthModal,
    openAuthModal,
    closeAuthModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
