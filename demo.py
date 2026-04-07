import os
from fastapi import Request, Response, HTTPException
from nicegui import ui, app
from nicegui_tldraw import tldraw, register_asset_handlers, register_lifecycle


ASSET_PATH = "/tmp/vaultscope"


# @app.post("/_nicegui_tldraw/upload/{asset_name}")
# async def upload_handler(asset_name, request: Request):
#     file_path = os.path.join(ASSET_PATH, asset_name)
#     try:
#         file_content = await request.body()
#         with open(file_path, "wb") as buffer:
#             buffer.write(file_content)
#     except Exception as ex:
#         raise HTTPException(status_code=500, detail=str(ex))

#     return {"ok": True}


# @app.get("/_nicegui_tldraw/upload/{asset_name}")
# async def get_handler(asset_name):
#     file_path = os.path.join(ASSET_PATH, asset_name)
#     if not os.path.exists(file_path):
#         raise HTTPException(status_code=404, detail="File not found")
#     try:
#         with open(file_path, "rb") as file:
#             file_content = file.read()
#     except Exception as ex:
#         raise HTTPException(status_code=500, detail=str(ex))

#     return Response(content=file_content, media_type="application/octet-stream")

register_asset_handlers()
# register_lifecycle(enable_sourcemap=True)


@ui.page("/")
async def index():
    ui.add_css(
        """
    .q-page { display: flex }
    .nicegui-content { flex: 1 }
    .tl-container ol, ul {list-style: revert}
    """
    )

    async def handle_set_room(room):
        await ui.run_javascript(f"console.log('[DEMO IS RENDERING] {room}');")
        render_tldraw.refresh(room)

    with ui.row():
        ui.button("Room 1", on_click=lambda: handle_set_room("room_1"))
        ui.button("Room 2", on_click=lambda: handle_set_room("room_2"))
        ui.button("Room 3", on_click=lambda: handle_set_room("room_3"))

    @ui.refreshable
    async def render_tldraw(room):
        tldraw_instance = tldraw(
            room=room,
            user_preferences={
                "id": "281752",
                "name": "Alex McPilon",
            },
            sync_server=None,
        ).classes("grow w-full")

        def handle_init_tldraw():
            tldraw_instance.run_editor_method("zoomToFit")
            tldraw_instance.run_editor_method("setCurrentTool", "hand")
            # tldraw_thing.run_editor_method("updateInstanceState", {"isFocusMode": True})

        tldraw_instance.on("ready", handle_init_tldraw)

    await render_tldraw("room_2")


ui.run(port=9000, show=False)
