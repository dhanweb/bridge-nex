import RoomsSidebar from "@/components/RoomsSidebar";
import { listRooms } from "@/lib/room";
import { CreateRoomButtonInline } from "@/components/CreateRoomButtonInline";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export default function HomePage() {
  const rooms = listRooms();
  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <RoomsSidebar rooms={rooms} />
      <div className="flex-1 flex items-center justify-center text-slate-300">
        {rooms.length === 0 ? (
          <div className="text-center space-y-3">
            <p>暂无房间，先创建一个吧。</p>
            <div className="inline-flex justify-center"><CreateRoomButtonInline /></div>
          </div>
        ) : (
          <div className="text-sm text-slate-400">请选择左侧的房间。</div>
        )}
      </div>
    </div>
  );
}
