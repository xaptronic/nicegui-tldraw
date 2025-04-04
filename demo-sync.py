from nicegui import ui
from nicegui_tldraw import tldraw, register_lifecycle, register_asset_handlers

# Register asset handlers for file uploads
register_asset_handlers()

# Register the sync server lifecycle hooks
register_lifecycle()


@ui.page("/")
async def index():
    ui.add_css(
        """
    .q-page { display: flex }
    .nicegui-content { flex: 1 }
    """
    )

    # Create a Tldraw instance with sync server enabled
    tldraw_instance = tldraw(
        room="my_room",  # Optional: specify a room for collaboration
        user_preferences={
            "id": "user123",
            "name": "John Doe",
        },
    ).classes("grow w-full")

    # Optional: Initialize the editor with some settings
    def handle_init_tldraw():
        tldraw_instance.run_editor_method("zoomToFit")
        tldraw_instance.run_editor_method("setCurrentTool", "hand")

    tldraw_instance.on("ready", handle_init_tldraw)


ui.run()
