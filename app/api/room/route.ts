import { NextResponse } from "next/server";
import { listRooms, createRoom } from "@/lib/room";

export async function GET() {
  const rooms = listRooms();
  return NextResponse.json(rooms);
}

export async function POST(request: Request) {
  const data = await request.json();
  const name = (data?.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  if (name.length > 64) {
    return NextResponse.json({ error: "Name too long" }, { status: 400 });
  }
  const room = createRoom(name);
  return NextResponse.json(room, { status: 201 });
}
