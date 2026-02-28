"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  Copy,
  Download,
  Hash,
  Image as ImageIcon,
  Loader2,
  Menu,
  Paperclip,
  Plus,
  Send,
  Trash2,
  X,
  File as FileIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Room {
  id: string;
  name: string;
  created_at: number;
}

interface Item {
  id: string;
  room_id: string;
  type: "text" | "file" | "image";
  content: string | null;
  file_path: string | null;
  file_size: number | null;
  created_at: number;
}

function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return "";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handle = () => setIsMobile(mq.matches);
    handle();
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);
  return isMobile;
}

export default function RoomClient({
  rooms,
  initialItems,
  currentRoom,
}: {
  rooms: Room[];
  initialItems: Item[];
  currentRoom: Room;
}) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Sync when server data changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(initialItems);
    setText("");
    setFile(null);
  }, [initialItems, currentRoom.id]);

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
    if (id === currentRoom.id) {
      router.push("/");
    } else {
      router.refresh();
    }
  }

  async function clearRoom(id: string) {
    const ok = confirm("确定清空房间内容？");
    if (!ok) return;
    const res = await fetch(`/api/room/${id}/items`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("清空失败");
      return;
    }
    setItems([]);
    toast.success("已清空");
  }

  async function deleteItem(id: string) {
    const res = await fetch(`/api/item/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("删除失败");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("已删除");
  }

  async function submitItem() {
    if (!text.trim() && !file) {
      toast.error("请输入文本或选择文件");
      return;
    }
    const form = new FormData();
    form.append("roomId", currentRoom.id);
    if (text.trim()) form.append("content", text.trim());
    if (file) form.append("file", file);

    setIsPending(true);
    const res = await fetch("/api/item", { method: "POST", body: form });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "提交失败");
      setFile(null);
      setText("");
      router.refresh();
      return;
    }
    const item = await res.json();
    setItems((prev) => [item, ...prev]);
    setText("");
    setFile(null);
    toast.success("已提交");
    router.refresh();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 200 * 1024 * 1024) {
      toast.error("文件超过 200MB 限制");
      e.target.value = "";
      return;
    }
    setFile(f);
  }

  const composerDisabled = isPending;

  const ContentCard = ({ item }: { item: Item }) => {
    if (item.type === "text") {
      return (
        <div className="flex flex-col gap-3 rounded-2xl bg-card/80 p-4 border border-white/5 shadow-sm">
          <div className="text-xs text-muted-foreground">
            {new Date(item.created_at).toLocaleString()}
          </div>
          <div className="relative rounded-xl bg-black/40 p-3 font-mono text-sm text-blue-100 border border-white/5">
            <button
              onClick={() => {
                navigator.clipboard.writeText(item.content || "");
                toast.success("已复制");
              }}
              className="absolute right-2 top-2 rounded bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
            >
              <Copy className="h-3 w-3" />
            </button>
            <pre className="whitespace-pre-wrap break-words leading-relaxed">
              {item.content}
            </pre>
          </div>
        </div>
      );
    }

    if (item.type === "image") {
      return (
        <div className="rounded-2xl bg-card/80 p-4 border border-white/5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{new Date(item.created_at).toLocaleString()}</span>
            <span>{formatBytes(item.file_size)}</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-white/5 bg-black/30">
            <Image
              src={`/api/file/${item.id}`}
              alt="uploaded"
              width={800}
              height={600}
              className="w-full h-auto object-contain"
            />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <a
              href={`/api/file/${item.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground hover:bg-secondary/80"
              download
            >
              <Download className="h-4 w-4" /> 下载
            </a>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ImageIcon className="h-4 w-4" /> 图片
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl bg-card/80 p-4 border border-white/5 shadow-sm">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>{new Date(item.created_at).toLocaleString()}</span>
          <span>{formatBytes(item.file_size)}</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 p-3">
          <div className="rounded-lg bg-amber-500/20 p-3 border border-amber-500/20">
            <FileIcon className="h-6 w-6 text-amber-300" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-foreground truncate">文件</p>
            <p className="text-xs text-muted-foreground">{formatBytes(item.file_size)}</p>
          </div>
          <a
            href={`/api/file/${item.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs text-primary-foreground hover:bg-primary/90"
            download
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      {/* Sidebar */}
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
            <span>Active Rooms</span>
            <span className="text-slate-600">{rooms.length}</span>
          </div>
          <div className="space-y-2">
            {sortedRooms.map((room) => (
              <div
                key={room.id}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 border border-transparent cursor-pointer hover:border-slate-600 hover:bg-slate-800/50",
                  room.id === currentRoom.id && "border-blue-500/50 bg-slate-800/70"
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

          <form className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-slate-500">创建房间</label>
            <div className="flex gap-2">
              <input
                disabled
                className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-slate-500"
                placeholder="在左侧创建房间"
              />
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-400"
                disabled
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-800 bg-[#0f172a]/90 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-300"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Hash className="h-4 w-4 text-slate-500" /> {currentRoom.name}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#0f172a] px-4 py-4 md:px-8 md:py-6">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 pb-28">
            {items.map((item) => (
              <div key={item.id} className="relative">
                <ContentCard item={item} />
                <button
                  className="absolute right-3 top-3 rounded-full bg-black/40 p-2 text-slate-300 hover:text-white"
                  onClick={() => deleteItem(item.id)}
                  title="删除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {items.length === 0 && (
              <div className="mt-10 text-center text-sm text-muted-foreground">
                这里还没有内容，试着发送文本或文件。
              </div>
            )}
          </div>
        </main>

        <footer className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent px-4 pb-5 pt-2 md:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl border-2 border-dashed border-slate-700 bg-[#1e293b] p-3 shadow-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl p-3 text-slate-300 hover:bg-slate-800 hover:text-white"
                title="选择文件"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="在此输入文本，或选择文件..."
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              {file && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-200">
                  <FileIcon className="h-4 w-4" /> {file.name} ({formatBytes(file.size)})
                  <button onClick={() => setFile(null)} className="text-slate-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <button
                onClick={submitItem}
                disabled={composerDisabled}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500 disabled:opacity-60"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}发送
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>最大 200MB，文件名自动生成，不会暴露原始文件名。</span>
              <span className="hidden sm:block">房间：{currentRoom.name}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
