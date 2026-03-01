import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { IncomingMessage } from "http";

const PORT = Number(process.env.WS_PORT || 4001);
const HOST = process.env.WS_HOST || "0.0.0.0";

// Message types
// Client -> server: {type: "subscribe", roomId: string}
// Server -> client: item:created | item:deleted | room:cleared | ping
// HTTP POST /notify with body {type, roomId, item?, id?}

interface ServerEvent {
  type: "item:created" | "item:deleted" | "room:cleared";
  roomId: string;
  item?: any;
  id?: string;
}

type ClientMessage =
  | { type: "subscribe"; roomId: string }
  | { type: "unsubscribe"; roomId: string };

type Client = {
  socket: WebSocket;
  rooms: Set<string>;
};

const clients = new Set<Client>();

function broadcast(event: ServerEvent) {
  for (const client of clients) {
    if (client.rooms.has(event.roomId)) {
      try {
        client.socket.send(JSON.stringify(event));
      } catch (err) {
        console.error("Failed to send to client", err);
      }
    }
  }
}

function handleClientMessage(client: Client, data: WebSocket.RawData) {
  try {
    const msg = JSON.parse(data.toString()) as ClientMessage;
    if (msg.type === "subscribe" && msg.roomId) {
      client.rooms.add(msg.roomId);
      return;
    }
    if (msg.type === "unsubscribe" && msg.roomId) {
      client.rooms.delete(msg.roomId);
      return;
    }
  } catch (err) {
    console.warn("Invalid client message", err);
  }
}

function createWsServer(server: http.Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket: WebSocket, _req: IncomingMessage) => {
    const client: Client = { socket, rooms: new Set() };
    clients.add(client);

    socket.on("message", (data) => handleClientMessage(client, data));
    socket.on("close", () => {
      clients.delete(client);
    });
    socket.on("error", () => {
      clients.delete(client);
      socket.close();
    });
  });

  const interval = setInterval(() => {
    for (const client of clients) {
      if (client.socket.readyState !== WebSocket.OPEN) continue;
      try {
        client.socket.ping();
      } catch {}
    }
  }, 30000);

  wss.on("close", () => clearInterval(interval));

  return wss;
}

function createHttpServer() {
  const server = http.createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/notify") {
      try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk as Buffer);
        }
        const body = Buffer.concat(chunks).toString();
        const event = JSON.parse(body) as ServerEvent;
        if (!event?.type || !event?.roomId) {
          res.statusCode = 400;
          res.end("invalid payload");
          return;
        }
        broadcast(event);
        res.statusCode = 200;
        res.end("ok");
      } catch (err) {
        console.error("notify error", err);
        res.statusCode = 400;
        res.end("error");
      }
      return;
    }
    res.statusCode = 404;
    res.end("not found");
  });

  return server;
}

const server = createHttpServer();
createWsServer(server);

server.listen(PORT, HOST, () => {
  console.log(`WS server listening on ws://${HOST}:${PORT}`);
});
