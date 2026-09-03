"""WebSocket endpoint for live task status updates.

Client connects to /ws/tasks/{task_id} and receives streamed events:
  {"type":"status","state":"running"} | {"type":"token","delta":"..."} |
  {"type":"tool","name":"web_search"} | {"type":"done","message":"..."} |
  {"type":"error","message":"..."}
"""
from __future__ import annotations

import asyncio
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.security import decode_token
from app.realtime import hub

router = APIRouter()


@router.websocket("/ws/tasks/{task_id}")
async def task_ws(ws: WebSocket, task_id: str):
    # Token delivered as ?token=... (WS cannot set Authorization header easily)
    token = ws.query_params.get("token")
    try:
        decode_token(token or "")
    except Exception:
        await ws.close(code=4401)
        return
    await ws.accept()

    queue: asyncio.Queue = asyncio.Queue()

    def _on_event(ev: dict) -> None:
        queue.put_nowait(ev)

    hub.subscribe(task_id, _on_event)
    try:
        while True:
            ev = await queue.get()
            await ws.send_text(json.dumps(ev))
            if ev.get("type") in ("done", "error"):
                break
    except WebSocketDisconnect:
        pass
    finally:
        hub.unsubscribe(task_id, _on_event)
