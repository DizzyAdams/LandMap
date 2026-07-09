"""Read cleaned datasets out of DuckDB (ingesting on first access if needed)."""

from __future__ import annotations

import polars as pl

from .db import get_duckdb
from .ingest import ingest_properties


def _ensure_ingested(conn) -> None:
    exists = conn.execute(
        "SELECT 1 FROM information_schema.tables WHERE table_name = 'properties'"
    ).fetchone()
    if not exists:
        ingest_properties(conn=conn)


def load_properties(conn=None) -> pl.DataFrame:
    own = conn is None
    c = conn or get_duckdb()
    try:
        _ensure_ingested(c)
        return c.execute("SELECT * FROM properties").pl()
    finally:
        if own:
            c.close()


def load_price_history(conn=None) -> pl.DataFrame:
    own = conn is None
    c = conn or get_duckdb()
    try:
        _ensure_ingested(c)
        return c.execute("SELECT * FROM price_history").pl()
    finally:
        if own:
            c.close()
