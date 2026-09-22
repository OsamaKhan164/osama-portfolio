import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const ThemeContext = createContext(undefined);

const STORAGE_KEY = "theme";

function readSavedTheme() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

function getSystemTheme() {
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
  return prefersLight ? "light" : "dark";
}

function getInitialTheme() {
  if (typeof window === "undefined") return "dark";
  return readSavedTheme() ?? getSystemTheme();
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // True once the user has actively picked a theme via the toggle. Captured
  // once at mount from whatever was already in storage, so an initial
  // system-derived theme does NOT count as an explicit choice.
  const hasExplicitChoice = useRef(readSavedTheme() !== null);

  // Reflect the current theme on <html>.
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  // Live-follow the OS theme setting for as long as the user hasn't
  // explicitly chosen one themselves (requirement: system preference only
  // applies when it doesn't conflict with a saved user preference).
  useEffect(() => {
    if (hasExplicitChoice.current) return;

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = (e) => setTheme(e.matches ? "light" : "dark");

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      hasExplicitChoice.current = true;
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // If storage is unavailable, the choice still applies for this session.
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
