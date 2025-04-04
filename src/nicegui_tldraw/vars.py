import os

ASSET_PATH = os.getenv("NICEGUI_TLDRAW_ASSET_PATH", "/tmp/nicegui_tldraw")
SYNC_SERVER_PORT = int(os.getenv("NICEGUI_TLDRAW_SYNC_SERVER_PORT", "8081"))
SYNC_SERVER = os.getenv("NICEGUI_TLDRAW_SYNC_SERVER", f"127.0.0.1:{SYNC_SERVER_PORT}")
ASSET_STORE_URL = os.getenv("NICEGUI_TLDRAW_ASSET_STORE_URL", "/_nicegui_tldraw")
DEFAULT_ROOM = os.getenv("NICEGUI_TLDRAW_DEFAULT_ROOM", "nicegui_tldraw")
SYNC_STATE_DIR = os.getenv("NICEGUI_TLDRAW_SYNC_STATE_DIR", "/tmp/nicegui_tldraw")
SYNC_SERVER_PATH = os.getenv(
    "NICEGUI_TLDRAW_SYNC_SERVER_PATH", "lib/tldraw/server.min.js"
)
NODE_BIN_PATH = os.getenv("NICEGUI_TLDRAW_NODE_BIN_PATH", "/opt/homebrew/bin/node")
