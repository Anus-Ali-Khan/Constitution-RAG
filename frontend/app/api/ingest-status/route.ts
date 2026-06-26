import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return Response.json({ error: "jobId required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/ingest-status/${jobId}`);
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ error: "Backend unreachable" }, { status: 503 });
  }
}
