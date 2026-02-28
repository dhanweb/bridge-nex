import { NextResponse } from "next/server";
import { listItems, clearRoom } from "@/lib/item";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const roomId = params.id;
  if (!roomId) {
    return NextResponse.json({ error: "Room id required" }, { status: 400 });
  }
  const items = listItems(roomId);
  return NextResponse.json(items);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const roomId = params.id;
  if (!roomId) {
    return NextResponse.json({ error: "Room id required" }, { status: 400 });
  }
  clearRoom(roomId);
  return NextResponse.json({ ok: true });
}
