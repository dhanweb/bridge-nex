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
  const stmt = db.prepare("SELECT * FROM room ORDER BY created_at DESC");
  return stmt.all() as Room[];
}

export function createRoom(name: string): Room {
  const db = getDb();
  const id = uuidv4();
  const created_at = Date.now();
  const stmt = db.prepare("INSERT INTO room (id, name, created_at) VALUES (?, ?, ?)");
  stmt.run(id, name, created_at);
  return { id, name, created_at };
}

export function updateRoomName(id: string, name: string): void {
  const db = getDb();
  db.prepare("UPDATE room SET name = ? WHERE id = ?").run(name, id);
}

export function deleteRoom(id: string): void {
  // 删除房间前先清理房间内容及文件
  clearRoom(id);
  const db = getDb();
  db.prepare("DELETE FROM room WHERE id = ?").run(id);
}
