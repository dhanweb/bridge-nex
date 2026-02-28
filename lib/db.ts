import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "storage", "data.db");

// Ensure storage directory exists
const storageDir = path.join(process.cwd(), "storage");
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

let db: Database.Database | null = null;

export function getDb() {
  if (db) return db;
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`CREATE TABLE IF NOT EXISTS room (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS item (
    id TEXT PRIMARY KEY,
    room_id TEXT,
    type TEXT,
    content TEXT,
    file_path TEXT,
    file_size INTEGER,
    created_at INTEGER
  );`);
  return db;
}
