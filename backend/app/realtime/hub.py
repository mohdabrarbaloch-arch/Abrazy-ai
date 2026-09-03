"""In-memory realtime hub for WebSocket task-status broadcast.

Production would use Redis pub/sub; this hub works for a single instance and is
the seam where a distributed transport plugs in. Consumers subscribe per task_id.
"""
from __future__ import annotations

import asyncio
from typing import Callable

Hub = dict[str, set[Callable[[dict], None]]]


class _Hub:
    def __init__(self) -> None:
        self._subs: Hub = {}
        self._lock = asyncio.Lock()

    def subscribe(self, task_id: str, cb: Callable[[dict], None]) -> None:
        self._subs.setdefault(task_id, set()).add(cb)

    def unsubscribe(self, task_id: str, cb: Callable[[dict], None]) -> None:
        subs = self._subs.get(task_id)
        if subs and cb in subs:
            subs.discard(cb)
            if not subs:
                self._subs.pop(task_id, None)

    def broadcast(self, task_id: str, event: dict) -> None:
        for cb in list(self._subs.get(task_id, set())):
            try:
                cb(event)
            except Exception:  # noqa: BLE001
                pass


hub = _Hub()
