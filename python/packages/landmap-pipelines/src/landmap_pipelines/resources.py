"""Dagster resources: DuckDB connection factory + MLflow client."""

from __future__ import annotations

from pathlib import Path

from dagster import ConfigurableResource

from landmap_data.config import DSConfig
from landmap_data.db import get_duckdb


class DuckDBResource(ConfigurableResource):
    path: str = ".cache/landmap.duckdb"

    def get_connection(self):
        cfg = DSConfig(duckdb_path=Path(self.path))
        return get_duckdb(cfg)


class MLflowResource(ConfigurableResource):
    tracking_uri: str = "file:./.cache/mlruns"

    def get_client(self):
        import mlflow

        mlflow.set_tracking_uri(self.tracking_uri)
        return mlflow
