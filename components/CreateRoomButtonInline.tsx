"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

export function CreateRoomButtonInline({
  onCreated,
}: {
  onCreated?: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (trimmed.length > 64) {
      toast.error("名称过长");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        toast.error("创建失败");
        return;
      }
      const room = await res.json();
      onCreated?.(room.id);
      setName("");
      setOpen(false);
    } catch {
      toast.error("创建失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-500 disabled:opacity-60"
        disabled={loading}
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" /> 创建房间
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#111827] border border-slate-700 p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-white">新建房间</div>
              <button
                className="p-1 text-slate-400 hover:text-white"
                onClick={() => {
                  setOpen(false);
                  setName("");
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={64}
                placeholder="房间名称（最长 64 字）"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleCreate();
                  }
                  if (e.key === "Escape") {
                    setOpen(false);
                    setName("");
                  }
                }}
              />
              <div className="flex justify-end gap-2 text-sm">
                <button
                  type="button"
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 hover:border-slate-500"
                  onClick={() => {
                    setOpen(false);
                    setName("");
                  }}
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => void handleCreate()}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-500 disabled:opacity-60"
                >
                  {loading ? "创建中..." : "确定"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
