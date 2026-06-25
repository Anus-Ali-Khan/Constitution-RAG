"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: "relative",
        width: 56,
        height: 30,
        borderRadius: 15,
        border: "1px solid var(--border)",
        background: isDark ? "#1c2130" : "#e0eaff",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
        outline: "none",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Sun icon — left side */}
      <span
        style={{
          position: "absolute",
          left: 8,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          opacity: isDark ? 0.25 : 1,
          transition: "opacity 0.25s ease",
        }}
      >
        <Sun size={12} color={isDark ? "#8b949e" : "#d97706"} />
      </span>

      {/* Moon icon — right side */}
      <span
        style={{
          position: "absolute",
          right: 8,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          opacity: isDark ? 1 : 0.25,
          transition: "opacity 0.25s ease",
        }}
      >
        <Moon size={12} color={isDark ? "var(--accent)" : "#94a3b8"} />
      </span>

      {/* Sliding knob */}
      <span
        style={{
          position: "absolute",
          top: 4,
          left: isDark ? 4 : "calc(100% - 24px)",
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: isDark
            ? "linear-gradient(135deg, #58a6ff, #bc8cff)"
            : "linear-gradient(135deg, #f59e0b, #f97316)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease",
          boxShadow: "0 1px 6px rgba(0,0,0,0.3)",
        }}
      >
        {isDark ? (
          <Moon size={10} color="#fff" />
        ) : (
          <Sun size={10} color="#fff" />
        )}
      </span>
    </button>
  );
}
