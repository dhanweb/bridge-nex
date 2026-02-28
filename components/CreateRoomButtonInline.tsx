"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function CreateRoomButtonInline({
  onCreated,
}: {
  onCreated?: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-500 disabled:opacity-60"
      disabled={loading}
      onClick={async () => {
        const name = prompt("输入房间名称（最长 64 字）")?.trim();
        if (!name) return;
        if (name.length > 64) {
          toast.error("名称过长");
          return;
        }
        setLoading(true);
        try {
          const res = await fetch("/api/room", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          });
          if (!res.ok) {
            toast.error("创建失败");
            return;
          }
          const room = await res.json();
          onCreated?.(room.id);
        } catch (e) {
          toast.error("创建失败");
        } finally {
          setLoading(false);
        }
      }}
    >
      <Plus className="h-4 w-4" /> {loading ? "创建中..." : "创建房间"}
    </button>
  );
}
