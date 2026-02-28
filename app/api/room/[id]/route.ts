import { NextResponse } from "next/server";
import { deleteRoom } from "@/lib/room";

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
