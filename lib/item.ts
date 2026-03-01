import fs from "fs";
import path from "path";
import mime from "mime-types";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

export type ItemType = "text" | "file" | "image";

export interface Item {
  id: string;
  room_id: string;
  type: ItemType;
  content: string | null;
  file_path: string | null;
  file_size: number | null;
  created_at: number;
}

export function listItems(roomId: string): Item[] {
  const db = getDb();
  const stmt = db.prepare(
    "SELECT * FROM item WHERE room_id = ? ORDER BY created_at DESC"
  );
  return stmt.all(roomId) as Item[];
}

export function getItem(id: string): Item | undefined {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM item WHERE id = ?");
  return stmt.get(id) as Item | undefined;
}

export function createText(roomId: string, content: string): Item {
  const db = getDb();
  const id = uuidv4();
  const created_at = Date.now();
  const stmt = db.prepare(
    "INSERT INTO item (id, room_id, type, content, file_path, file_size, created_at) VALUES (?, ?, 'text', ?, NULL, NULL, ?)"
  );
  stmt.run(id, roomId, content, created_at);
  return {
    id,
    room_id: roomId,
    type: "text",
    content,
    file_path: null,
    file_size: null,
    created_at,
  };
}

export function createFile(
  roomId: string,
  fileBuffer: Buffer,
  originalMime?: string | null
): Item {
  if (fileBuffer.byteLength > MAX_FILE_SIZE) {
    throw new Error("File too large");
  }
  const db = getDb();
  const id = uuidv4();
  const created_at = Date.now();
  const storageDir = path.join(process.cwd(), "storage", roomId);
  fs.mkdirSync(storageDir, { recursive: true });

  const mimeType = originalMime || "application/octet-stream";
  const ext = mime.extension(mimeType) || "bin";
  const filename = `${uuidv4()}.${ext}`;
  const filePath = path.join(storageDir, filename);
  fs.writeFileSync(filePath, fileBuffer);

  const stmt = db.prepare(
    "INSERT INTO item (id, room_id, type, content, file_path, file_size, created_at) VALUES (?, ?, ?, NULL, ?, ?, ?)"
  );
  const type: ItemType = mimeType.startsWith("image/") ? "image" : "file";
  const file_size = fileBuffer.byteLength;
  stmt.run(id, roomId, type, filePath, file_size, created_at);

  return {
    id,
    room_id: roomId,
    type,
    content: null,
    file_path: filePath,
    file_size,
    created_at,
  };
}

export function deleteItem(id: string): void {
  const db = getDb();
  const item = getItem(id);
  if (!item) return;
  if (item.file_path) {
    try {
      fs.unlinkSync(item.file_path);
    } catch (e) {
      // ignore missing file
    }
  }
  const stmt = db.prepare("DELETE FROM item WHERE id = ?");
  stmt.run(id);
}

export function clearRoom(roomId: string): void {
  const db = getDb();
  const items = listItems(roomId);
  for (const item of items) {
    if (item.file_path) {
      try {
        fs.unlinkSync(item.file_path);
      } catch {}
    }
  }
  const stmt = db.prepare("DELETE FROM item WHERE room_id = ?");
  stmt.run(roomId);
  const dir = path.join(process.cwd(), "storage", roomId);
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}
