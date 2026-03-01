// Simple notifier: Next.js APIs POST to ws server
const WS_NOTIFY_URL = process.env.WS_NOTIFY_URL || "http://127.0.0.1:4001/notify";

export type WsEvent =
  | { type: "item:created"; roomId: string; item: any }
  | { type: "item:deleted"; roomId: string; id: string }
  | { type: "room:cleared"; roomId: string };

export async function notify(event: WsEvent) {
  try {
    await fetch(WS_NOTIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event),
      // don't await long
    });
  } catch (err) {
    console.warn("notify ws failed", err);
  }
}
