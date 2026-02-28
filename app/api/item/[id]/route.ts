import { NextResponse } from "next/server";
import { deleteItem } from "@/lib/item";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  deleteItem(id);
  return NextResponse.json({ ok: true });
}
