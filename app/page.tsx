import { listRooms } from "@/lib/room";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CreateRoomButton } from "@/components/CreateRoomButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

async function RoomsList() {
  const rooms = listRooms();
  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">暂无房间，先创建一个吧。</p>
        <CreateRoomButton />
      </div>
    );
  }
  return (
    <div className="grid gap-3">
      {rooms.map((room) => (
        <Link
          key={room.id}
          href={`/room/${room.id}`}
          className="group flex items-center justify-between rounded-xl border border-white/5 bg-card px-4 py-3 shadow-sm hover:border-primary/50 hover:bg-card/80"
        >
          <div>
            <div className="text-sm font-semibold text-foreground">{room.name}</div>
            <div className="text-xs text-muted-foreground">
              创建于 {new Date(room.created_at).toLocaleString()}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
        </Link>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const rooms = listRooms();
  if (rooms.length > 0) {
    redirect(`/room/${rooms[0].id}`);
  }
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16">
      <div className="w-full space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-foreground">BridgeNext</h1>
          <p className="text-sm text-muted-foreground">
            个人局域网文件 / 图片 / 文本中转站
          </p>
        </div>
        <RoomsList />
      </div>
    </main>
  );
}
