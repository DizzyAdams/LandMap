"""Ingest raw properties (from seed JSON or Postgres) into DuckDB tables."""

from __future__ import annotations

import json
from pathlib import Path

import polars as pl

from .config import DSConfig, get_config
from .models import PricePoint, Property


def _load_seed(path: Path) -> list[Property]:
    raw = json.loads(Path(path).read_text(encoding="utf-8"))
    return [Property(**p) for p in raw]


def properties_frame(properties: list[Property]) -> pl.DataFrame:
    rows = [
        {**p.model_dump(exclude={"priceHistory"}), "property_id": p.id}
        for p in properties
    ]
    return pl.DataFrame(rows)


def price_history_frame(properties: list[Property]) -> pl.DataFrame:
    rows: list[dict] = []
    for p in properties:
        for pt in p.priceHistory:
            rows.append({"property_id": p.id, "date": pt.date, "price": pt.price})
    return pl.DataFrame(rows)


def ingest_properties(json_path: Path | None = None, *, conn=None) -> None:
    """Load properties + price history into DuckDB tables `properties`/`price_history`."""
    config = get_config()
    json_path = json_path or (config.data_dir / "properties.json")
    props = _load_seed(json_path)

    own = conn is None
    connection = conn or get_duckdb(config)
    try:
        connection.execute("DROP TABLE IF EXISTS properties")
        connection.execute("DROP TABLE IF EXISTS price_history")
        connection.register("__props", properties_frame(props).to_pandas())
        connection.execute("CREATE TABLE properties AS SELECT * FROM __props")
        connection.register("__ph", price_history_frame(props).to_pandas())
        connection.execute("CREATE TABLE price_history AS SELECT * FROM __ph")
    finally:
        if own:
            connection.close()
