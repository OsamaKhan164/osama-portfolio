import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle({ display = "flex" }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className={`${display} h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted transition-colors duration-300 hover:text-gold`}
    >
      {isLight ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
