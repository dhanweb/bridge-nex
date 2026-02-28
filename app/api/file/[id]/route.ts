import fs from "fs";
import path from "path";
import mime from "mime-types";
import { NextResponse } from "next/server";
import { getItem } from "@/lib/item";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const item = getItem(id);
  if (!item || !item.file_path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!fs.existsSync(item.file_path)) {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
  const data = fs.readFileSync(item.file_path);
  const mimeType = mime.lookup(path.extname(item.file_path)) || "application/octet-stream";
  const headers = new Headers();
  headers.set("Content-Type", mimeType);
  const disposition = mimeType.startsWith("image/") ? "inline" : "attachment";
  headers.set("Content-Disposition", `${disposition}; filename=\"${id}\"`);
  return new NextResponse(data, { status: 200, headers });
}
