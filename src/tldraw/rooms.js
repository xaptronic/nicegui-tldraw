import AsyncLock from "async-lock";
import { TLSocketRoom } from "@tldraw/sync-core";
import throttle from "lodash.throttle";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const DIR = process.env.NICEGUI_TLDRAW_SYNC_STATE_DIR || "./.rooms";

async function readSnapshotIfExists(roomId) {
  try {
    const data = await readFile(join(DIR, roomId));
    return JSON.parse(data.toString()) ?? undefined;
  } catch (err) {
    return undefined;
  }
}

async function saveSnapshot(roomId, snapshot) {
  await writeFile(join(DIR, roomId), JSON.stringify(snapshot));
}

const rooms = new Map();
const roomLocks = new AsyncLock();

export async function makeOrLoadRoom(roomId) {
  return await roomLocks.acquire(roomId, async () => {
    if (rooms.has(roomId)) {
      const roomState = rooms.get(roomId);
      if (!roomState.room.isClosed()) {
        return roomState.room;
      }
    }
    const initialSnapshot = await readSnapshotIfExists(roomId);
    const roomState = {
      id: roomId,
      room: new TLSocketRoom({
        initialSnapshot,
        onSessionRemoved(room, args) {
          console.log(
            "[nicegui_tldraw] client disconnected",
            args.sessionId,
            roomId
          );
          // if (args.numSessionsRemaining === 0) {
          //   console.log("[nicegui_tldraw] closing room", roomId);
          //   room.close();
          //   rooms.delete(roomId);
          // }
        },
        onDataChange: throttle(async () => {
          try {
            saveSnapshot(roomState.id, roomState.room.getCurrentSnapshot());
          } catch (err) {
            console.log("[nicegui_tldraw] error persisting snapshot");
            console.error(err);
          }
        }, 10_000),
      }),
    };

    rooms.set(roomId, roomState);
    return roomState.room;
  });
}
