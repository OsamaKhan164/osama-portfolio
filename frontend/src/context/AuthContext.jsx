import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(undefined);
const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount (and whenever the token changes), verify it against the
  // backend and hydrate the user — this is what makes auth survive a
  // page refresh instead of just trusting a stored token blindly.
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const data = await api.me(token);
        if (!cancelled) setUser(data.user);
      } catch {
        // Token invalid/expired — clear it out.
        if (!cancelled) {
          setUser(null);
          setToken(null);
          try {
            window.localStorage.removeItem(TOKEN_KEY);
          } catch {
            /* ignore */
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [token]);

  function persistToken(newToken) {
    setToken(newToken);
    try {
      window.localStorage.setItem(TOKEN_KEY, newToken);
    } catch {
      /* session still works without persistence */
    }
  }

  async function login(email, password) {
    const data = await api.login({ email, password });
    setUser(data.user);
    persistToken(data.token);
    return data; // { user, token } — callers may need the fresh token immediately
  }

  async function register(name, email, password) {
    const data = await api.register({ name, email, password });
    setUser(data.user);
    persistToken(data.token);
    return data; // { user, token }
  }

  function logout() {
    setUser(null);
    setToken(null);
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
