"""Lightweight feature store: persist/read feature frames in DuckDB."""

from __future__ import annotations

import polars as pl

from landmap_data.db import get_duckdb


class FeatureStore:
    def __init__(self, conn=None):
        self._own = conn is None
        self.conn = conn or get_duckdb()

    def write(self, df: pl.DataFrame, name: str = "features") -> None:
        self.conn.register(f"__{name}", df.to_pandas())
        self.conn.execute(f"DROP TABLE IF EXISTS {name}")
        self.conn.execute(f"CREATE TABLE {name} AS SELECT * FROM __{name}")

    def read(self, name: str = "features") -> pl.DataFrame:
        return self.conn.execute(f"SELECT * FROM {name}").pl()

    def close(self) -> None:
        if self._own:
            self.conn.close()

    def __enter__(self) -> "FeatureStore":
        return self

    def __exit__(self, *exc) -> None:
        self.close()
