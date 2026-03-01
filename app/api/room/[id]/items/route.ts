import { NextResponse } from "next/server";
import { listItems, clearRoom } from "@/lib/item";
import { notify } from "@/lib/ws-bus";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: roomId } = await params;
  if (!roomId) {
    return NextResponse.json({ error: "Room id required" }, { status: 400 });
  }
  const items = listItems(roomId);
  return NextResponse.json(items);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: roomId } = await params;
  if (!roomId) {
    return NextResponse.json({ error: "Room id required" }, { status: 400 });
  }
  clearRoom(roomId);
  void notify({ type: "room:cleared", roomId });
  return NextResponse.json({ ok: true });
}
