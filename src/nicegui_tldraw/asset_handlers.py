import os
from fastapi import Request, Response, HTTPException
from nicegui import app

from nicegui_tldraw.vars import ASSET_PATH


def register_asset_handlers(asset_path=ASSET_PATH):
    os.makedirs(asset_path, exist_ok=True)

    @app.post("/_nicegui_tldraw/upload/{asset_name}")
    async def upload_handler(asset_name, request: Request):
        file_path = os.path.join(asset_path, asset_name)
        try:
            file_content = await request.body()
            with open(file_path, "wb") as buffer:
                buffer.write(file_content)
        except Exception as ex:
            raise HTTPException(status_code=500, detail=str(ex))

        return {"ok": True}

    @app.get("/_nicegui_tldraw/upload/{asset_name}")
    async def get_handler(asset_name):
        file_path = os.path.join(asset_path, asset_name)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        try:
            with open(file_path, "rb") as file:
                file_content = file.read()
        except Exception as ex:
            raise HTTPException(status_code=500, detail=str(ex))

        return Response(content=file_content, media_type="application/octet-stream")
