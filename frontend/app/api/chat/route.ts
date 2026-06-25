import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query?.trim()) {
      return Response.json({ error: "Query is required" }, { status: 400 });
    }

    // Proxy to Python backend when available; return a stub otherwise.
    try {
      const upstream = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!upstream.ok) throw new Error(`Backend ${upstream.status}`);
      const data = await upstream.json();
      return Response.json(data);
    } catch {
      // Stub response when no backend is running
      return Response.json({
        answer:
          `You asked: "${query}"\n\n` +
          `The backend RAG service is not yet connected. Once your Python backend is running at ${BACKEND_URL}, ` +
          `answers will be retrieved from the vector store and displayed here.`,
        sources: ["stub — backend offline"],
      });
    }
  } catch (err) {
    console.error("[chat]", err);
    return Response.json({ error: "Request failed" }, { status: 500 });
  }
}
