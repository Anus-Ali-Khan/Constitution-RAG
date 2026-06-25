"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Scale,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Trash2,
  CloudUpload,
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function IconBtn({
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
        background: hovered ? "var(--bg-hover)" : "none",
        border: "none",
        cursor: "pointer",
        color: hovered ? "var(--text-primary)" : "var(--text-muted)",
        padding: "5px",
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState<string[]>([]);

  const uploadFile = useCallback(async (file: File) => {
    const id = `${file.name}-${Date.now()}`;
    setFiles((prev) => [
      { id, name: file.name, size: file.size, status: "uploading" },
      ...prev,
    ]);
    setUploading((prev) => [...prev, id]);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: res.ok ? "success" : "error", error: data.error }
            : f
        )
      );
    } catch {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: "error", error: "Network error" } : f
        )
      );
    } finally {
      setUploading((prev) => prev.filter((x) => x !== id));
    }
  }, []);

  const onDrop = useCallback(
    (accepted: File[]) => accepted.forEach(uploadFile),
    [uploadFile]
  );

  const { getRootProps, getInputProps, isDragActive, open: openPicker } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
        "text/plain": [".txt"],
        "application/msword": [".doc"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      },
      noClick: true,
    });

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  const indexed = files.filter((f) => f.status === "success").length;

  return (
    <aside
      style={{
        width: open ? 280 : 0,
        minWidth: open ? 280 : 0,
        transition: "width 0.28s cubic-bezier(0.4,0,0.2,1), min-width 0.28s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      {/* Fixed-width inner so content doesn't reflow while animating */}
      <div style={{ width: 280, height: "100%", display: "flex", flexDirection: "column" }}>

        {/* ── Header ── */}
        <div
          style={{
            padding: "18px 16px 14px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(88,166,255,0.3)",
            }}
          >
            <Scale size={17} color="#fff" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
              ConstitutionRAG
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
              AI Legal Assistant
            </div>
          </div>

          <IconBtn onClick={onToggle} title="Collapse sidebar">
            <ChevronLeft size={16} />
          </IconBtn>
        </div>

        {/* ── Upload Zone ── */}
        <div style={{ padding: "16px 14px 0", flexShrink: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px 2px" }}>
            Documents
          </p>

          <div
            {...getRootProps()}
            style={{
              border: `1.5px dashed ${isDragActive ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 12,
              padding: "22px 16px",
              textAlign: "center",
              background: isDragActive ? "var(--accent-bg)" : "var(--bg-primary)",
              transition: "border-color 0.2s, background 0.2s",
              cursor: "default",
            }}
          >
            <input {...getInputProps()} />

            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: isDragActive ? "var(--accent-bg)" : "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                transition: "background 0.2s",
              }}
            >
              <CloudUpload
                size={19}
                color={isDragActive ? "var(--accent)" : "var(--text-secondary)"}
              />
            </div>

            <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              {isDragActive ? "Release to upload" : "Drop files here"}
            </p>
            <p style={{ margin: "0 0 14px", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
              PDF, DOCX, TXT &middot; up to 50 MB
            </p>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); openPicker(); }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 16px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-bg)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-secondary)";
              }}
            >
              <Upload size={12} />
              Browse files
            </button>
          </div>
        </div>

        {/* ── File list ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 0" }}>
          {files.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "28px 12px",
                color: "var(--text-muted)",
              }}
            >
              <FileText size={28} style={{ opacity: 0.2, marginBottom: 8 }} />
              <span style={{ fontSize: 12 }}>No documents yet</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {indexed > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 10px",
                    borderRadius: 8,
                    background: "rgba(63,185,80,0.07)",
                    border: "1px solid rgba(63,185,80,0.2)",
                    marginBottom: 4,
                  }}
                >
                  <CheckCircle size={13} color="var(--success)" />
                  <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 500 }}>
                    {indexed} doc{indexed !== 1 ? "s" : ""} ready for RAG
                  </span>
                </div>
              )}

              {files.map((file) => (
                <FileRow key={file.id} file={file} onRemove={removeFile} />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Uploads saved to{" "}
            <code
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 10,
                background: "var(--bg-tertiary)",
                padding: "1px 5px",
                borderRadius: 4,
                border: "1px solid var(--border)",
              }}
            >
              /docs
            </code>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </aside>
  );
}

function FileRow({
  file,
  onRemove,
}: {
  file: UploadedFile;
  onRemove: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const statusColor =
    file.status === "success"
      ? "var(--success)"
      : file.status === "error"
      ? "var(--danger)"
      : "var(--accent)";

  return (
    <div
      className="animate-slide-left"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "9px 10px",
        borderRadius: 9,
        border: "1px solid var(--border)",
        background: hovered ? "var(--bg-tertiary)" : "var(--bg-primary)",
        transition: "background 0.15s",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 7,
          background:
            file.status === "success"
              ? "rgba(63,185,80,0.1)"
              : file.status === "error"
              ? "rgba(248,81,73,0.1)"
              : "rgba(88,166,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {file.status === "uploading" ? (
          <div
            style={{
              width: 14,
              height: 14,
              border: "2px solid var(--accent)",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }}
          />
        ) : (
          <FileText size={14} color={statusColor} />
        )}
      </div>

      {/* Name + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {file.name}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
          {file.status === "uploading"
            ? "Uploading…"
            : file.status === "error"
            ? file.error || "Failed"
            : formatBytes(file.size)}
        </div>
      </div>

      {/* Status indicator */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
        {file.status === "success" && <CheckCircle size={13} color="var(--success)" />}
        {file.status === "error" && <XCircle size={13} color="var(--danger)" />}
      </div>

      {/* Delete */}
      {hovered && file.status !== "uploading" && (
        <button
          onClick={() => onRemove(file.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: 2,
            borderRadius: 4,
            display: "flex",
            flexShrink: 0,
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "var(--danger)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)")
          }
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}
