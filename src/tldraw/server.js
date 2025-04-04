import cors from "@fastify/cors";
import websocketPlugin from "@fastify/websocket";
import fastify from "fastify";
import { mkdir } from "fs/promises";
import { makeOrLoadRoom } from "./rooms.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8081;
const DIR = process.env.NICEGUI_TLDRAW_SYNC_STATE_DIR || "./.rooms";

const app = fastify();
app.register(websocketPlugin);
app.register(cors, { origin: "*" });
app.register(async (app) => {
  app.get(
    "/_nicegui_tldraw/connect/:roomId",
    { websocket: true },
    async (socket, req) => {
      const roomId = req.params.roomId;
      const sessionId = req.query["sessionId"];

      socket.on("error", async (error) => {
        console.error("WebSocket error:", error);
      });

      const room = await makeOrLoadRoom(roomId);

      room.handleSocketConnect({ sessionId, socket });
    }
  );
});

app.listen({ port: PORT }).then(async () => {
  try {
    await mkdir(DIR, { recursive: true });
  } catch (ex) {
    console.log(`${DIR} already exists`);
  }

  const address = app.server.address();
  console.log(
    `[nicegui_tldraw] server listening on http://${address.address}:${address.port}`
  );
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
