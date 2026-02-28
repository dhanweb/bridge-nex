"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Hash, Menu, Plus, Trash2, X } from "lucide-react";
import { CreateRoomButtonInline } from "./CreateRoomButtonInline";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type Room = {
  id: string;
  name: string;
  created_at: number;
};

export default function RoomsSidebar({ rooms }: { rooms: Room[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sortedRooms = useMemo(
    () => [...rooms].sort((a, b) => b.created_at - a.created_at),
    [rooms]
  );

  async function deleteRoom(id: string) {
    const ok = confirm("确定删除房间？房间内内容将被清空。");
    if (!ok) return;
    const res = await fetch(`/api/room/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("删除失败");
      return;
    }
    if (pathname === `/room/${id}`) {
      router.push("/room");
    } else {
      router.refresh();
    }
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-72 transform bg-[#1e293b] border-r border-slate-700 transition-transform md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center gap-3 p-5 border-b border-slate-700">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
            <Hash className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-white leading-none">BridgeNext</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">Local Transfer</div>
          </div>
          <button
            className="ml-auto p-2 text-slate-400 hover:text-white md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-80px)]">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Rooms</span>
            <span className="text-slate-600">{rooms.length}</span>
          </div>
          <div className="space-y-2">
            {sortedRooms.map((room) => (
              <div
                key={room.id}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 border border-transparent cursor-pointer hover:border-slate-600 hover:bg-slate-800/50",
                  pathname === `/room/${room.id}` && "border-blue-500/50 bg-slate-800/70"
                )}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                <Link
                  href={`/room/${room.id}`}
                  className="flex-1 truncate text-sm font-medium text-slate-200"
                  onClick={() => setSidebarOpen(false)}
                >
                  {room.name}
                </Link>
                <button
                  className="p-1 text-slate-500 hover:text-white"
                  onClick={() => deleteRoom(room.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <CreateRoomButtonInline onCreated={(id) => {
            setSidebarOpen(false);
            router.push(`/room/${id}`);
          }} />
        </div>
      </div>

      <button
        className="fixed bottom-4 left-4 z-20 rounded-full bg-blue-600 p-3 text-white shadow-lg shadow-blue-900/40 md:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  );
}
