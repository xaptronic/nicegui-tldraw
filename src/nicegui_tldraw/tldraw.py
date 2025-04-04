import subprocess
import os

from pathlib import Path

from nicegui import app
from nicegui.awaitable_response import AwaitableResponse
from nicegui.element import Element

from nicegui_tldraw.vars import (
    SYNC_SERVER,
    SYNC_SERVER_PORT,
    ASSET_STORE_URL,
    DEFAULT_ROOM,
    SYNC_STATE_DIR,
    SYNC_SERVER_PATH,
    NODE_BIN_PATH,
)

# Used to store a reference to the Popen object for the sync server for start / stop with NiceGUI hooks
SYNC_SERVER_POPEN = None


class Tldraw(
    Element,
    component="tldraw.js",
    dependencies=["lib/tldraw/tldraw.js"],
    default_classes="nicegui-tldraw",
):
    def __init__(
        self,
        sync_server=SYNC_SERVER,
        asset_store_url=ASSET_STORE_URL,
        room=DEFAULT_ROOM,
        user_preferences=None,
    ):
        super().__init__()
        self._props["sync_server"] = sync_server
        self._props["asset_store_url"] = asset_store_url
        self._props["room"] = room
        self._props["user_preferences"] = user_preferences

    def save(self, timeout: float = 1) -> AwaitableResponse:
        return self.run_method("save", timeout=timeout)

    def load(self, data, timeout: float = 1):
        self.run_method("load", data, timeout=timeout)

    def set_room(self, room: str):
        self._props["room"] = room
        self.update()

    def run_editor_method(self, name, *args, timeout: float = 1.0):
        return self.run_method("run_editor_method", name, *args, timeout=timeout)

    @classmethod
    def start_sync_server(
        cls,
        port=SYNC_SERVER_PORT,
        enable_sourcemap=False,
        no_minified=False,
    ):
        global SYNC_SERVER_POPEN

        # Allow to use lib/server.js in development mode
        server_script = Path(__file__).parent / SYNC_SERVER_PATH
        if no_minified:
            server_script = server_script.parent / server_script.name.replace(
                ".min.js", ".js"
            )

        env_vars = {
            "NODE_ENV": os.getenv("NODE_ENV", "development"),
            "PORT": str(port),
            "SYNC_STATE_DIR": SYNC_STATE_DIR,
        }

        env = os.environ.copy()
        env.update(env_vars)

        try:
            cmd = [NODE_BIN_PATH]
            if enable_sourcemap:
                cmd.append("--enable-source-maps")
            cmd.append("--trace-warnings")
            cmd.append(str(server_script))

            result = subprocess.Popen(
                cmd,
                env=env,
            )
            SYNC_SERVER_POPEN = result
        except Exception as ex:
            print(f"Failed to start sync server: {ex}")
            raise ex

    @classmethod
    def stop_sync_server(cls):
        global SYNC_SERVER_POPEN

        if SYNC_SERVER_POPEN is not None:
            SYNC_SERVER_POPEN.terminate()
            SYNC_SERVER_POPEN.wait()

        print("[nicegui_tldraw] stopped sync server")


def register_lifecycle(enable_sourcemap=False, no_minified=False):
    async def handle_startup():
        Tldraw.start_sync_server(
            enable_sourcemap=enable_sourcemap, no_minified=no_minified
        )

    app.on_startup(handle_startup)

    async def handle_shutdown():
        Tldraw.stop_sync_server()

    app.on_shutdown(handle_shutdown)
