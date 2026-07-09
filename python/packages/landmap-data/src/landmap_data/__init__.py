"""LandMap data layer: ingestion & storage (DuckDB + optional Postgres)."""

from .config import DSConfig, get_config
from .models import PricePoint, Property

__all__ = ["DSConfig", "get_config", "Property", "PricePoint"]
