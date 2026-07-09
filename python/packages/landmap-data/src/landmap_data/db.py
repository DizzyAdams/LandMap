"""Thin connectors for DuckDB (analytics warehouse) and Postgres (source of truth)."""

from __future__ import annotations

from pathlib import Path

import duckdb

from .config import DSConfig, get_config


def get_duckdb(config: DSConfig | None = None) -> duckdb.DuckDBPyConnection:
    config = config or get_config()
    path = config.duckdb_abs
    path.parent.mkdir(parents=True, exist_ok=True)
    return duckdb.connect(str(path))


def get_postgres(config: DSConfig | None = None):
    config = config or get_config()
    if not config.database_url:
        raise RuntimeError("LANDMAP_DATABASE_URL not set; Postgres ingest unavailable.")
    import psycopg

    return psycopg.connect(config.database_url)
