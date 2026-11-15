"use client";

import { Moon, Sun } from "lucide-react";

/** Switches between the light and dark theme and remembers the choice on this device. */
export function ThemeToggle({ className = "", label = false }: { className?: string; label?: boolean }) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("sg-theme", next);
    } catch {
      // Private browsing: the theme still changes for this visit.
    }
  };
  return (
    <button type="button" onClick={toggle} className={className} aria-label="Switch between light and dark mode">
      <Moon className="size-[1.15rem] dark:hidden" strokeWidth={1.5} />
      <Sun className="hidden size-[1.15rem] dark:block" strokeWidth={1.5} />
      {label && (
        <>
          <span className="dark:hidden">Dark mode</span>
          <span className="hidden dark:inline">Light mode</span>
        </>
      )}
    </button>
  );
}
