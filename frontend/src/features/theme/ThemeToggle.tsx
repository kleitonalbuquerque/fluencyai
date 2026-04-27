"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "fluencyai.theme";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  if (typeof window.matchMedia !== "function") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function SunIcon() {
  return (
    <svg aria-hidden="true" className="theme-icon" viewBox="0 0 24 24">
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 17a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM4.93 4.93a1 1 0 0 1 1.41 0l.71.7a1 1 0 0 1-1.42 1.42l-.7-.71a1 1 0 0 1 0-1.41Zm12.02 12.02a1 1 0 0 1 1.42 0l.7.71a1 1 0 0 1-1.41 1.41l-.71-.7a1 1 0 0 1 0-1.42ZM2 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Zm17 0a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1ZM7.05 16.95a1 1 0 0 1 0 1.42l-.71.7a1 1 0 1 1-1.41-1.41l.7-.71a1 1 0 0 1 1.42 0ZM19.07 4.93a1 1 0 0 1 0 1.41l-.7.71a1 1 0 0 1-1.42-1.42l.71-.7a1 1 0 0 1 1.41 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" className="theme-icon" viewBox="0 0 24 24">
      <path
        d="M21 14.7A8.5 8.5 0 0 1 9.3 3a.75.75 0 0 0-.78-1.18A10 10 0 1 0 22.18 15.5a.75.75 0 0 0-1.18-.79Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const preferredTheme = getPreferredTheme();
    setTheme(preferredTheme);
    applyTheme(preferredTheme);
  }, []);

  function handleToggle() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  const isDark = theme === "dark";

  return (
    <button
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      className="theme-toggle"
      onClick={handleToggle}
      type="button"
    >
      <span aria-hidden="true" className="theme-toggle-track">
        <span className="theme-toggle-thumb" />
      </span>
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
