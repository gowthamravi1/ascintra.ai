from __future__ import annotations

from typing import Optional
from contextlib import suppress

from app.core.config import settings

try:
    from arango import ArangoClient  # type: ignore
except Exception:  # pragma: no cover
    ArangoClient = None  # type: ignore

_client = None
_db = None


def get_db():
    global _client, _db
    if not settings.arango_enabled:
        return None
    if ArangoClient is None:
        return None
    if _db is None:
        _client = ArangoClient(hosts=settings.arango_url)
        _db = _client.db(
            settings.arango_db,
            username=settings.arango_user,
            password=settings.arango_password,
        )
    return _db


def has_collection(name: str) -> bool:
    db = get_db()
    if db is None:
        return False
    with suppress(Exception):
        return db.has_collection(name)
    return False

