import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query?.trim()) {
      return Response.json({ error: "Query is required" }, { status: 400 });
    }

    let upstream: Response;
    try {
      upstream = await fetch(`${BACKEND_URL}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(120_000),
      });
    } catch {
      // Network-level failure — backend is not reachable
      return Response.json({
        answer: `Could not reach the backend at ${BACKEND_URL}. Make sure the Python server is running with:\n\nuvicorn backend.main:app --reload`,
        sources: [],
      });
    }

    const data = await upstream.json();

    if (!upstream.ok) {
      // Backend returned an error — surface the real message
      const detail = data?.detail ?? data?.error ?? `Backend returned ${upstream.status}`;
      return Response.json({ answer: `Backend error: ${detail}`, sources: [] });
    }

    return Response.json(data);
  } catch (err) {
    console.error("[chat]", err);
    return Response.json({ error: "Request failed" }, { status: 500 });
  }
}
