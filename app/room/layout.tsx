import { listRooms } from "@/lib/room";
import RoomsSidebar from "@/components/RoomsSidebar";
import { ReactNode } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export default function RoomLayout({
  children,
}: {
  children: ReactNode;
}) {
  const rooms = listRooms();
  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <RoomsSidebar rooms={rooms} />
      <div className="flex-1 min-h-screen">{children}</div>
    </div>
  );
}
