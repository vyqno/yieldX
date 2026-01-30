"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme-store";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="glass-button p-2 rounded-full transition-all duration-300 hover:scale-110"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-foreground" />
      ) : (
        <Sun className="w-5 h-5 text-foreground" />
      )}
    </button>
  );
}
