# NiceGUI Tldraw

A NiceGUI wrapper around [Tldraw.js](https://www.tldraw.com/), providing a collaborative whiteboard experience in your NiceGUI applications.

## Features

- Seamless integration with NiceGUI
- Real-time collaboration through WebSocket sync server
- Asset management for images and other media
- Customizable user preferences
- Room-based collaboration

## Installation

```bash
pip install nicegui-tldraw
```

## Quick Start

### Example 1: Using Tldraw with Sync Server (Collaborative)

This example shows how to set up Tldraw with the sync server enabled for real-time collaboration:

```python
from nicegui import ui
from nicegui_tldraw import tldraw, register_lifecycle, register_asset_handlers

# Register asset handlers for file uploads
register_asset_handlers()

# Register the sync server lifecycle hooks
register_lifecycle()

@ui.page("/")
async def index():
    # Create a Tldraw instance with sync server enabled
    tldraw_instance = tldraw(
        room="my_room",  # Optional: specify a room for collaboration
        user_preferences={
            "id": "user123",
            "name": "John Doe",
        }
    ).classes("grow w-full")

    # Optional: Initialize the editor with some settings
    def handle_init_tldraw():
        tldraw_instance.run_editor_method("zoomToFit")
        tldraw_instance.run_editor_method("setCurrentTool", "hand")

    tldraw_instance.on("ready", handle_init_tldraw)

ui.run()
```

### Example 2: Using Tldraw without Sync Server (Local Only)

This example shows how to use Tldraw without the sync server for local-only drawing:

```python
from nicegui import ui
from nicegui_tldraw import tldraw, register_asset_handlers

# Register asset handlers for file uploads
register_asset_handlers()

@ui.page("/")
async def index():
    # Create a Tldraw instance without sync server
    tldraw_instance = tldraw(
        room="my_room",
        user_preferences={
            "id": "user123",
            "name": "John Doe",
        },
        sync_server=None  # Explicitly disable sync server
    ).classes("grow w-full")

    # Optional: Initialize the editor with some settings
    def handle_init_tldraw():
        tldraw_instance.run_editor_method("zoomToFit")
        tldraw_instance.run_editor_method("setCurrentTool", "hand")

    tldraw_instance.on("ready", handle_init_tldraw)

ui.run()
```

## Configuration

The package can be configured using environment variables or by passing parameters to the `tldraw` function:

### Sync Server Configuration

#### NICEGUI_TLDRAW_SYNC_SERVER
**Description**: The address of the sync server.
**Default Value**: "127.0.0.1:8081"
**Usage**:
- Set this to specify a different sync server address (e.g., "my-domain.com" if behind a proxy)
- Set to `None` to disable sync server functionality
- Can be overridden by passing `sync_server` parameter to `tldraw()`

#### NICEGUI_TLDRAW_SYNC_SERVER_PORT
**Description**: Determines the port used by the sync server.
**Default Value**: 8081
**Usage**: Set this environment variable to specify a different port.

#### NICEGUI_TLDRAW_SYNC_SERVER_PATH
**Description**: Specifies the path to the server script used in development mode.
**Default Value**: "lib/tldraw/server.js"
**Usage**: Set this environment variable to change the path if the server script is located elsewhere.

#### NODE_ENV
**Description**: Sets the Node.js environment mode.
**Default Value**: "development"
**Usage**: Adjust this environment variable to "production" or other Node.js environment settings as needed.

#### NICEGUI_TLDRAW_NODE_BIN_PATH
**Description**: Path to the Node.js binary.
**Default Value**: "/opt/homebrew/bin/node"
**Usage**: If Node.js is installed in a different location, update this environment variable to point to the correct binary.

### Asset Management

#### NICEGUI_TLDRAW_ASSET_PATH
**Description**: Directory where uploaded assets are stored.
**Default Value**: "/tmp/nicegui_tldraw"
**Usage**: Set this to specify a different storage location for assets.

#### NICEGUI_TLDRAW_ASSET_STORE_URL
**Description**: Base URL for asset storage.
**Default Value**: "/_nicegui_tldraw"
**Usage**: Change this if you need to use a different URL path for asset storage.

### Room Configuration

#### NICEGUI_TLDRAW_DEFAULT_ROOM
**Description**: Default room name for collaboration.
**Default Value**: "nicegui_tldraw"
**Usage**: Set this to change the default room name.

#### NICEGUI_TLDRAW_SYNC_STATE_DIR
**Description**: Directory where room state is stored.
**Default Value**: "/tmp/nicegui_tldraw"
**Usage**: Set this to specify a different location for storing room state.

## API Reference

### Tldraw Class

The main class for creating Tldraw instances in your NiceGUI application.

```python
tldraw(
    room: str = DEFAULT_ROOM,
    user_preferences: dict = None,
    sync_server: str = None,  # Set to None to disable sync server
    asset_store_url: str = None
)
```

### Methods

- `save(timeout: float = 1) -> AwaitableResponse`: Save the current state of the editor
- `load(data, timeout: float = 1)`: Load a saved state into the editor
- `set_room(room: str)`: Change the current room
- `run_editor_method(name, *args, timeout: float = 1.0)`: Run a method on the editor instance

### Lifecycle Management

- `register_lifecycle(enable_sourcemap=False, no_minified=False)`: Register hooks to start/stop the sync server with NiceGUI
- `register_asset_handlers()`: Register handlers for asset uploads and downloads

## Development

To build the package from source:

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -e .
   ```
3. Build the JavaScript components:
   ```bash
   cd src/tldraw
   npm install
   npm run build:all
   ```

## License

MIT
