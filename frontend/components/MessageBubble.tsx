"use client";

import { useState, useRef, useEffect } from "react";
import { User, Scale, Copy, Check, BookOpen, Pencil, X } from "lucide-react";
import type { Message } from "./ChatArea";

interface Props {
  message: Message;
  onEdit?: (id: string, newContent: string) => void;
}

export default function MessageBubble({ message, onEdit }: Props) {
  const [copied, setCopied]   = useState(false);
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const editRef = useRef<HTMLTextAreaElement>(null);
  const isUser  = message.role === "user";

  // Auto-resize edit textarea
  useEffect(() => {
    const ta = editRef.current;
    if (!ta || !editing) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }, [editText, editing]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (editing) {
      const ta = editRef.current;
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    }
  }, [editing]);

  const startEdit = () => {
    setEditText(message.content);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditText("");
  };

  const saveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== message.content) {
      onEdit?.(message.id, trimmed);
    }
    setEditing(false);
    setEditText("");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const time = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        gap: 10,
        padding: "6px 0",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Avatar ── */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: isUser
            ? "linear-gradient(135deg, var(--user-bubble-accent), var(--gradient-start))"
            : "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 4,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        {isUser ? <User size={15} color="#fff" /> : <Scale size={15} color="#fff" />}
      </div>

      {/* ── Content column ── */}
      <div style={{ maxWidth: "78%", minWidth: 60 }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
            flexDirection: isUser ? "row-reverse" : "row",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: isUser ? "var(--user-bubble-accent)" : "var(--accent)" }}>
            {isUser ? "You" : "Assistant"}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{time}</span>
        </div>

        {/* ── EDIT MODE ── */}
        {editing ? (
          <div
            style={{
              borderRadius: "14px 4px 14px 14px",
              border: "1.5px solid var(--accent)",
              background: "var(--user-bubble-bg)",
              boxShadow: "0 0 0 3px var(--accent-bg)",
              overflow: "hidden",
            }}
          >
            <textarea
              ref={editRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") cancelEdit();
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveEdit();
              }}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                outline: "none",
                resize: "none",
                color: "var(--text-primary)",
                fontSize: 14,
                lineHeight: 1.65,
                fontFamily: "inherit",
                padding: "12px 14px 4px",
                display: "block",
                overflow: "hidden",
                minHeight: 56,
              }}
            />

            {/* Hint */}
            <p style={{ margin: "2px 14px 8px", fontSize: 11, color: "var(--text-muted)" }}>
              <kbd style={kbdStyle}>Esc</kbd> cancel &nbsp;·&nbsp; <kbd style={kbdStyle}>⌘ Enter</kbd> save
            </p>

            {/* Action buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 7,
                padding: "9px 12px",
                borderTop: "1px solid var(--border)",
                background: "var(--bg-tertiary)",
              }}
            >
              <button
                onClick={cancelEdit}
                style={{
                  padding: "5px 14px",
                  borderRadius: 7,
                  border: "1px solid var(--border)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-secondary)",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  transition: "border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--danger)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--danger)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                }}
              >
                <X size={12} />
                Cancel
              </button>

              <button
                onClick={saveEdit}
                disabled={!editText.trim()}
                style={{
                  padding: "5px 16px",
                  borderRadius: 7,
                  border: "none",
                  background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: editText.trim() ? "pointer" : "not-allowed",
                  opacity: editText.trim() ? 1 : 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  transition: "opacity 0.15s, transform 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (editText.trim())
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "none";
                }}
              >
                Save &amp; Submit
              </button>
            </div>
          </div>
        ) : (
          /* ── NORMAL DISPLAY MODE ── */
          <>
            {/* Bubble */}
            <div
              style={{
                position: "relative",
                padding: "11px 15px",
                borderRadius: isUser ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                background: isUser ? "var(--user-bubble-bg)" : "var(--bg-secondary)",
                border: `1px solid ${isUser ? "var(--user-bubble-border)" : "var(--border)"}`,
                fontSize: 14,
                lineHeight: 1.65,
                color: "var(--text-primary)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {message.content}
            </div>

            {/* Action row — appears on hover below the bubble */}
            <div
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                gap: 4,
                marginTop: 5,
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.15s",
                pointerEvents: hovered ? "auto" : "none",
              }}
            >
              {/* Edit — user messages only */}
              {isUser && onEdit && (
                <ActionBtn onClick={startEdit} title="Edit message">
                  <Pencil size={12} />
                  <span style={{ fontSize: 11 }}>Edit</span>
                </ActionBtn>
              )}

              {/* Copy */}
              <ActionBtn onClick={copy} title={copied ? "Copied!" : "Copy message"}>
                {copied ? (
                  <Check size={12} color="var(--success)" />
                ) : (
                  <Copy size={12} />
                )}
              </ActionBtn>
            </div>

            {/* Sources (assistant only) */}
            {!isUser && message.sources && message.sources.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                  <BookOpen size={11} color="var(--text-muted)" />
                  <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>
                    Sources
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {message.sources.map((src, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 11,
                        padding: "2px 9px",
                        borderRadius: 20,
                        background: "var(--accent-bg)",
                        border: "1px solid var(--accent)",
                        color: "var(--accent)",
                        opacity: 0.85,
                      }}
                    >
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 8px",
        borderRadius: 6,
        border: "1px solid var(--border)",
        background: hovered ? "var(--bg-tertiary)" : "var(--bg-secondary)",
        color: hovered ? "var(--text-primary)" : "var(--text-muted)",
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
        fontSize: 12,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

const kbdStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "1px 5px",
  borderRadius: 4,
  border: "1px solid var(--border)",
  background: "var(--bg-tertiary)",
  fontFamily: "ui-monospace, monospace",
  fontSize: 10,
};
