"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  Copy,
  Download,
  Hash,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Send,
  Trash2,
  X,
  File as FileIcon,
  QrCode,
} from "lucide-react";

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

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "UTC",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function formatDate(ts: number) {
  return dateFormatter.format(new Date(ts));
}

function formatBytes(bytes: number | null) {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

type ItemWithStatus = Item & { status?: "pending" };

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
  const [items, setItems] = useState<ItemWithStatus[]>(initialItems);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setItems(initialItems);
    setText("");
    setFile(null);
  }, [initialItems, currentRoom.id]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  async function clearRoom(id: string) {
    const ok = confirm("确定清空房间内容？");
    if (!ok) return;
    const res = await fetch(`/api/room/${id}/items`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("清空失败");
      return;
    }
    setItems([]);
  }

  async function deleteItem(id: string) {
    const res = await fetch(`/api/item/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("删除失败");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function submitItem() {
    if (isPending) return;
    if (!text.trim() && !file) {
      toast.error("请输入文本或选择文件");
      return;
    }

    const trimmed = text.trim();
    const pendingId = `pending-${Date.now()}`;
    const inferredType: Item["type"] = file
      ? file.type.startsWith("image")
        ? "image"
        : "file"
      : "text";

    const pendingItem: ItemWithStatus = {
      id: pendingId,
      room_id: currentRoom.id,
      type: inferredType,
      content: inferredType === "text" ? trimmed : file?.name || "",
      file_path: null,
      file_size: file?.size ?? null,
      created_at: Date.now(),
      status: "pending",
    };

    const form = new FormData();
    form.append("roomId", currentRoom.id);
    if (trimmed) form.append("content", trimmed);
    if (file) form.append("file", file);

    setIsPending(true);
    setItems((prev) => [pendingItem, ...prev]);
    setText("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      const res = await fetch("/api/item", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "提交失败");
        setItems((prev) => prev.filter((i) => i.id !== pendingId));
        return;
      }
      const item = (await res.json()) as Item;
      setItems((prev) =>
        prev.map((i) => (i.id === pendingId ? item : i))
      );
    } catch (err) {
      toast.error("提交失败");
      setItems((prev) => prev.filter((i) => i.id !== pendingId));
    } finally {
      setIsPending(false);
    }
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

  const renderTimestamp = (item: ItemWithStatus) => {
    if (item.status === "pending") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-200">
          <Loader2 className="h-3 w-3 animate-spin" /> 发送中...
        </span>
      );
    }
    return formatDate(item.created_at);
  };

  const roomUrl = typeof window !== "undefined" ? `${window.location.origin}/room/${currentRoom.id}` : "";

  async function openQr() {
    if (!roomUrl) return;
    setQrOpen(true);
    if (qrDataUrl) return;
    try {
      setQrLoading(true);
      const data = await QRCode.toDataURL(roomUrl, { width: 320 });
      setQrDataUrl(data);
    } catch {
      toast.error("生成二维码失败");
    } finally {
      setQrLoading(false);
    }
  }
  const ContentCard = ({ item }: { item: ItemWithStatus }) => {
    if (item.type === "text") {
      const copied = copiedId === item.id;
      return (
        <div className="flex flex-col gap-3 rounded-2xl bg-card/80 p-4 border border-white/5 shadow-sm">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            {renderTimestamp(item)}
          </div>
          <div className="relative rounded-xl bg-black/40 p-3 font-mono text-sm text-blue-100 border border-white/5">
            <button
              onClick={() => {
                navigator.clipboard.writeText(item.content || "");
                setCopiedId(item.id);
                if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
                copyTimerRef.current = setTimeout(() => setCopiedId(null), 1500);
              }}
              className="absolute right-2 top-2 inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
            >
              <Copy className="h-3 w-3" /> {copied ? "已复制" : "复制"}
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
            <span>{renderTimestamp(item)}</span>
            <span>{formatBytes(item.file_size)}</span>
          </div>
          {item.status === "pending" ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/30 text-sm text-slate-400">
              图片上传中...
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/5 bg-black/30">
              <Image
                src={`/api/file/${item.id}`}
                alt="uploaded"
                width={800}
                height={600}
                className="w-full h-auto object-contain"
              />
            </div>
          )}
          <div className="mt-3 flex items-center gap-2">
            {item.status === "pending" ? (
              <div className="inline-flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2 text-xs text-secondary-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> 等待完成
              </div>
            ) : (
              <a
                href={`/api/file/${item.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground hover:bg-secondary/80"
                download
              >
                <Download className="h-4 w-4" /> 下载
              </a>
            )}
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
          <span>{renderTimestamp(item)}</span>
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
          {item.status === "pending" ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-2 text-xs text-slate-200">
              <Loader2 className="h-4 w-4 animate-spin" /> 等待完成
            </div>
          ) : (
            <a
              href={`/api/file/${item.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs text-primary-foreground hover:bg-primary/90"
              download
            >
              <Download className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
      {qrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-xs rounded-2xl bg-[#111827] border border-slate-700 p-4 shadow-2xl text-center space-y-3">
            <div className="flex items-center justify-between text-sm text-white">
              <span>扫码加入房间</span>
              <button className="p-1 text-slate-400 hover:text-white" onClick={() => setQrOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-xl bg-white p-3 flex items-center justify-center min-h-[200px]">
              {qrLoading || !qrDataUrl ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> 生成中...
                </div>
              ) : (
                <img src={qrDataUrl} alt="房间二维码" className="w-full h-full object-contain" />
              )}
            </div>
            <div className="text-[11px] text-slate-400 break-all">{roomUrl}</div>
            <button
              className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500"
              onClick={() => {
                navigator.clipboard.writeText(roomUrl);
                toast.success("链接已复制");
              }}
            >
              复制房间链接
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
