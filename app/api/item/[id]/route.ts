import { NextResponse } from "next/server";
import { deleteItem, getItem } from "@/lib/item";
import { notify } from "@/lib/ws-bus";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const item = getItem(id);
  deleteItem(id);
  if (item) {
    void notify({ type: "item:deleted", roomId: item.room_id, id });
  }
  return NextResponse.json({ ok: true });
}
