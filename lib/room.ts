import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";
import { clearRoom } from "./item";

export interface Room {
  id: string;
  name: string;
  created_at: number;
}

export function listRooms(): Room[] {
  const db = getDb();
  const stmt = db.prepare<Room>("SELECT * FROM room ORDER BY created_at DESC");
  return stmt.all();
}

export function createRoom(name: string): Room {
  const db = getDb();
  const id = uuidv4();
  const created_at = Date.now();
  const stmt = db.prepare("INSERT INTO room (id, name, created_at) VALUES (?, ?, ?)");
  stmt.run(id, name, created_at);
  return { id, name, created_at };
}

export function deleteRoom(id: string): void {
  const db = getDb();
  clearRoom(id);
  const stmt = db.prepare("DELETE FROM room WHERE id = ?");
  stmt.run(id);
  const dir = path.join(process.cwd(), "storage", id);
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}
