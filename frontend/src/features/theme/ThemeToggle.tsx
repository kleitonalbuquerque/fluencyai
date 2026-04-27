"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "fluencyai.theme";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  
  if (typeof window.matchMedia !== "function") return "dark";
  
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialTheme = getPreferredTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) {
    return <div className="p-2 w-10 h-10" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="p-2 text-neutral-400 hover:text-white transition-colors flex items-center justify-center rounded-lg hover:bg-white/5"
      onClick={handleToggle}
      type="button"
    >
      <span className="material-symbols-outlined">
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
