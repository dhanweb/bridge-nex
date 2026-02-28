import { notFound } from "next/navigation";
import { listRooms } from "@/lib/room";
import { listItems } from "@/lib/item";
import RoomClient from "./RoomClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export default function RoomPage({
  params,
}: {
  params: { id: string };
}) {
  const rooms = listRooms();
  const currentRoom = rooms.find((r) => r.id === params.id);
  if (!currentRoom) {
    notFound();
  }
  const items = listItems(params.id);
  return (
    <RoomClient rooms={rooms} initialItems={items} currentRoom={currentRoom!} />
  );
}
