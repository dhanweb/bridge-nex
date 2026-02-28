import { listRooms } from "@/lib/room";
import RoomsSidebar from "@/components/RoomsSidebar";
import { CreateRoomButtonInline } from "@/components/CreateRoomButtonInline";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export default function RoomIndexPage() {
  const rooms = listRooms();
  if (rooms.length === 0) {
    return (
      <div className="flex min-h-screen bg-[#0f172a]">
        <RoomsSidebar rooms={rooms} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3 text-slate-300">
            <p>暂无房间，先创建一个吧。</p>
            <CreateRoomButtonInline />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <RoomsSidebar rooms={rooms} />
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        请选择左侧的房间。
      </div>
    </div>
  );
}
