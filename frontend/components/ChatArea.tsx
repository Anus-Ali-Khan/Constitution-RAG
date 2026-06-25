"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Scale, PanelLeft, RotateCcw, ArrowUp } from "lucide-react";
import TypingIndicator from "./TypingIndicator";
import MessageBubble from "./MessageBubble";
import ThemeToggle from "./ThemeToggle";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  timestamp: Date;
}

interface ChatAreaProps {
  sidebarOpen: boolean;
  onOpenSidebar: () => void;
}

const SUGGESTED: { emoji: string; text: string }[] = [
  { emoji: "⚖️", text: "What is the 18th Amendment?" },
  { emoji: "📜", text: "Explain fundamental rights in the Constitution." },
  { emoji: "🏛️", text: "What does Article 6 say about the federation?" },
  { emoji: "👤", text: "How is the Prime Minister elected?" },
];

export default function ChatArea({ sidebarOpen, onOpenSidebar }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  };

  const sendMessage = useCallback(
    async (text?: string) => {
      const query = (text ?? input).trim();
      if (!query || loading) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        content: query,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: data.answer ?? "No answer returned.",
            sources: data.sources,
            timestamp: new Date(),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            content: "Something went wrong. Please try again.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading]
  );

  const handleEdit = useCallback(
    async (msgId: string, newContent: string) => {
      if (loading) return;
      const trimmed = newContent.trim();
      if (!trimmed) return;

      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === msgId);
        if (idx === -1) return prev;
        const userMsg: Message = {
          id: `u-${Date.now()}`,
          role: "user",
          content: trimmed,
          timestamp: new Date(),
        };
        return [...prev.slice(0, idx), userMsg];
      });

      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed }),
        });
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: data.answer ?? "No answer returned.",
            sources: data.sources,
            timestamp: new Date(),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            content: "Something went wrong. Please try again.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const canSend = input.trim().length > 0 && !loading;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--bg-primary)",
        overflow: "hidden",
      }}
    >
      {/* ── Top bar ── */}
      <header
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 10,
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-secondary)",
          flexShrink: 0,
        }}
      >
        {!sidebarOpen && (
          <HeaderBtn onClick={onOpenSidebar} title="Open sidebar">
            <PanelLeft size={17} />
          </HeaderBtn>
        )}

        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <Scale size={17} color="var(--accent)" />
          <span
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            Constitution Assistant
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 20,
              background: "var(--accent-bg)",
              color: "var(--accent)",
              border: "1px solid var(--accent)",
              opacity: 0.7,
              letterSpacing: "0.04em",
            }}
          >
            RAG
          </span>
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ThemeToggle />

          {messages.length > 0 && (
            <HeaderBtn onClick={() => setMessages([])} title="Clear conversation">
              <RotateCcw size={15} />
            </HeaderBtn>
          )}
        </div>
      </header>

      {/* ── Messages ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.length === 0 ? (
          <WelcomeScreen onSuggest={sendMessage} />
        ) : (
          <div
            style={{
              maxWidth: 740,
              width: "100%",
              margin: "0 auto",
              padding: "28px 20px 8px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} onEdit={handleEdit} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} style={{ height: 1 }} />
          </div>
        )}

        {messages.length === 0 && <div ref={bottomRef} />}
      </div>

      {/* ── Input bar ── */}
      <div
        style={{
          padding: "12px 20px 18px",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            maxWidth: 740,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 10,
              padding: "10px 10px 10px 16px",
              borderRadius: 14,
              border: `1.5px solid ${inputFocused ? "var(--accent)" : "var(--border)"}`,
              background: "var(--bg-primary)",
              boxShadow: inputFocused
                ? "0 0 0 3px var(--accent-bg)"
                : "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKey}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Ask anything about the Constitution…"
              rows={1}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                resize: "none",
                color: "var(--text-primary)",
                fontSize: 14,
                lineHeight: "1.6",
                fontFamily: "inherit",
                maxHeight: 180,
                padding: 0,
              }}
            />

            <button
              onClick={() => sendMessage()}
              disabled={!canSend}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "none",
                cursor: canSend ? "pointer" : "default",
                background: canSend
                  ? "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))"
                  : "var(--bg-hover)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                opacity: canSend ? 1 : 0.45,
                transition: "opacity 0.2s, transform 0.1s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                if (canSend)
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "none";
              }}
            >
              {loading ? (
                <div
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              ) : (
                <ArrowUp size={16} color="#fff" />
              )}
            </button>
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 7,
            }}
          >
            <kbd style={kbdStyle}>Enter</kbd> send &nbsp;&middot;&nbsp;{" "}
            <kbd style={kbdStyle}>Shift+Enter</kbd> new line
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
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

function HeaderBtn({
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
        background: hovered ? "var(--bg-tertiary)" : "none",
        border: "none",
        cursor: "pointer",
        color: hovered ? "var(--text-primary)" : "var(--text-muted)",
        padding: 7,
        borderRadius: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

function WelcomeScreen({ onSuggest }: { onSuggest: (t: string) => void }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px 24px",
        maxWidth: 660,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 22,
          boxShadow: "0 8px 24px rgba(88,166,255,0.25)",
        }}
      >
        <Scale size={28} color="#fff" />
      </div>

      {/* Headline */}
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--text-primary)",
          margin: "0 0 10px",
          textAlign: "center",
        }}
      >
        Constitution Assistant
      </h1>

      <p
        style={{
          fontSize: 15,
          color: "var(--text-secondary)",
          margin: "0 0 36px",
          lineHeight: 1.65,
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        Ask any question about constitutional law and get precise, sourced answers powered by RAG.
      </p>

      {/* Suggestion grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          width: "100%",
        }}
      >
        {SUGGESTED.map((s) => (
          <SuggestionCard key={s.text} emoji={s.emoji} text={s.text} onClick={() => onSuggest(s.text)} />
        ))}
      </div>

      {/* Hint */}
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 28, textAlign: "center" }}>
        Upload your own documents in the sidebar to extend the knowledge base.
      </p>
    </div>
  );
}

function SuggestionCard({
  emoji,
  text,
  onClick,
}: {
  emoji: string;
  text: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "var(--bg-tertiary)" : "var(--bg-secondary)",
        border: `1px solid ${hovered ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 12,
        padding: "14px 16px",
        textAlign: "left",
        cursor: "pointer",
        transition: "border-color 0.18s, background 0.18s, transform 0.15s",
        transform: hovered ? "translateY(-2px)" : "none",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: hovered ? "var(--shadow-md)" : "none",
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{emoji}</span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: hovered ? "var(--text-primary)" : "var(--text-secondary)",
          lineHeight: 1.4,
          transition: "color 0.15s",
        }}
      >
        {text}
      </span>
    </button>
  );
}
