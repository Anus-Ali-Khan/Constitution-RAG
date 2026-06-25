"use client";

import { Scale } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "6px 0",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 4,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        <Scale size={15} color="#fff" />
      </div>

      <div
        style={{
          padding: "12px 16px",
          borderRadius: "4px 14px 14px 14px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 5,
          marginTop: 4,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot"
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent)",
              opacity: 0.4,
            }}
          />
        ))}
      </div>
    </div>
  );
}
