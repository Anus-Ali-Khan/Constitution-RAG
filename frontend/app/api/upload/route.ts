import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ error: "File type not supported" }, { status: 415 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return Response.json({ error: "File exceeds 50 MB limit" }, { status: 413 });
    }

    // Re-create the file from its bytes so Node.js fetch serialises it correctly
    const bytes = await file.arrayBuffer();
    const blob = new Blob([bytes], { type: file.type });

    const upstream = new FormData();
    upstream.append("file", blob, file.name);

    const res = await fetch(`${BACKEND_URL}/ingest`, {
      method: "POST",
      body: upstream,
    });

    if (!res.ok) {
      const text = await res.text();
      return Response.json({ error: text || "Ingestion request failed" }, { status: res.status });
    }

    return Response.json({ success: true, name: file.name });
  } catch (err) {
    console.error("[upload]", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
