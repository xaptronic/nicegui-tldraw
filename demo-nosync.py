from nicegui import ui
from nicegui_tldraw import tldraw, register_asset_handlers

# Register asset handlers for file uploads
register_asset_handlers()


@ui.page("/")
async def index():
    ui.add_css(
        """
    .q-page { display: flex }
    .nicegui-content { flex: 1 }
    """
    )

    # Create a Tldraw instance without sync server
    tldraw_instance = tldraw(
        room="my_room",
        user_preferences={
            "id": "user123",
            "name": "John Doe",
        },
        sync_server=None,  # Explicitly disable sync server
    ).classes("grow w-full")

    # Optional: Initialize the editor with some settings
    def handle_init_tldraw():
        tldraw_instance.run_editor_method("zoomToFit")
        tldraw_instance.run_editor_method("setCurrentTool", "hand")

    tldraw_instance.on("ready", handle_init_tldraw)


ui.run()
