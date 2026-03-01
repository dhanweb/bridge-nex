"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Hash, Menu, PencilLine, Trash2, X } from "lucide-react";
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
  const [renameOpenId, setRenameOpenId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);

  const sortedRooms = useMemo(
    () => [...rooms].sort((a, b) => b.created_at - a.created_at),
    [rooms]
  );

  const closeRenameModal = () => {
    setRenameOpenId(null);
    setRenameValue("");
    setRenameLoading(false);
  };

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

  async function saveName(id: string, value: string) {
    const name = value.trim();
    if (!name) {
      toast.error("名称不能为空");
      return;
    }
    if (name.length > 64) {
      toast.error("名称过长");
      return;
    }
    setRenameLoading(true);
    const res = await fetch(`/api/room/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setRenameLoading(false);
    if (!res.ok) {
      toast.error("更新失败");
      return;
    }
    closeRenameModal();
    router.refresh();
  }

  return (
    <>
      {/* mobile overlay: tap main area to close sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-72 transform bg-[#1e293b] border-r border-slate-700 transition-transform md:static md:translate-x-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center gap-3 p-5 border-b border-slate-700 bg-[#1e293b]">
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
            {sortedRooms.map((room) => {
              const active = pathname === `/room/${room.id}`;
              return (
                <div
                  key={room.id}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2 border border-transparent cursor-pointer hover:border-slate-600 hover:bg-slate-800/50",
                    active && "border-blue-500/50 bg-slate-800/70"
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
                    onClick={() => {
                      setRenameOpenId(room.id);
                      setRenameValue(room.name);
                    }}
                  >
                    <PencilLine className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1 text-slate-500 hover:text-white"
                    onClick={() => deleteRoom(room.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <CreateRoomButtonInline
            onCreated={(id) => {
              setSidebarOpen(false);
              router.push(`/room/${id}`);
              router.refresh();
            }}
          />
        </div>
      </div>

      <button
        className="fixed bottom-4 left-4 z-20 rounded-full bg-blue-600 p-3 text-white shadow-lg shadow-blue-900/40 md:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {renameOpenId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#111827] border border-slate-700 p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-white">修改房间名称</div>
              <button className="p-1 text-slate-400 hover:text-white" onClick={closeRenameModal}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                maxLength={64}
                placeholder="房间名称（最长 64 字）"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void saveName(renameOpenId, renameValue);
                  }
                  if (e.key === "Escape") {
                    closeRenameModal();
                  }
                }}
              />
              <div className="flex justify-end gap-2 text-sm">
                <button
                  type="button"
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 hover:border-slate-500"
                  onClick={closeRenameModal}
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => void saveName(renameOpenId, renameValue)}
                  disabled={renameLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-500 disabled:opacity-60 whitespace-nowrap"
                >
                  {renameLoading ? "保存中..." : "确定"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
