import { NextResponse } from "next/server";
import { deleteRoom, updateRoomName } from "@/lib/room";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const roomId = params.id;
  if (!roomId) {
    return NextResponse.json({ error: "Room id required" }, { status: 400 });
  }
  deleteRoom(roomId);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const roomId = params.id;
  if (!roomId) {
    return NextResponse.json({ error: "Room id required" }, { status: 400 });
  }
  const data = await req.json().catch(() => ({}));
  const name = String(data?.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  if (name.length > 64) {
    return NextResponse.json({ error: "Name too long" }, { status: 400 });
  }
  updateRoomName(roomId, name);
  return NextResponse.json({ ok: true });
}
