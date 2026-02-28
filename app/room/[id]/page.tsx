import { notFound } from "next/navigation";
import { listRooms } from "@/lib/room";
import { listItems } from "@/lib/item";
import RoomClient from "./RoomClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rooms = listRooms();
  const currentRoom = rooms.find((r) => r.id === id);
  if (!currentRoom) {
    notFound();
  }
  const items = listItems(id);
  return (
    <RoomClient rooms={rooms} initialItems={items} currentRoom={currentRoom!} />
  );
}
