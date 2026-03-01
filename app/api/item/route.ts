import { NextResponse } from "next/server";
import { createText, createFile } from "@/lib/item";
import { getDb } from "@/lib/db";
import { notify } from "@/lib/ws-bus";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Use form-data" }, { status: 400 });
  }
  const form = await request.formData();
  const roomId = String(form.get("roomId") || "").trim();
  const content = String(form.get("content") || "").trim();
  const file = form.get("file") as File | null;

  if (!roomId) {
    return NextResponse.json({ error: "roomId required" }, { status: 400 });
  }

  // Ensure room exists
  const db = getDb();
  const exists = db.prepare("SELECT 1 FROM room WHERE id = ?").get(roomId);
  if (!exists) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  try {
    if (file && file.size > 0) {
      if (file.size > 200 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File too large (max 200MB)" },
          { status: 413 }
        );
      }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const item = createFile(roomId, buffer, file.type || undefined);
      void notify({ type: "item:created", roomId, item });
      return NextResponse.json(item, { status: 201 });
    }

    if (!content) {
      return NextResponse.json({ error: "content or file required" }, { status: 400 });
    }
    if (content.length > 5000) {
      return NextResponse.json({ error: "Content too long" }, { status: 400 });
    }

    const item = createText(roomId, content);
    void notify({ type: "item:created", roomId, item });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    if (err?.message === "File too large") {
      return NextResponse.json({ error: "File too large (max 200MB)" }, { status: 413 });
    }
    console.error("create item error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
