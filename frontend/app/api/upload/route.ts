import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const DOCS_DIR = path.resolve(process.cwd(), "..", "docs");

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const allowed = ["application/pdf", "text/plain", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) {
      return Response.json({ error: "File type not supported" }, { status: 415 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return Response.json({ error: "File exceeds 50 MB limit" }, { status: 413 });
    }

    await mkdir(DOCS_DIR, { recursive: true });

    const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const dest = path.join(DOCS_DIR, safe);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(dest, buffer);

    return Response.json({ success: true, path: dest, name: safe });
  } catch (err) {
    console.error("[upload]", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
