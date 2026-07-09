"""Shared configuration, reusing the same env conventions as `@landmap/config`."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# python/packages/landmap-data/src/landmap_data/config.py -> repo root (LandMap/)
REPO_ROOT = Path(__file__).resolve().parents[5]
DEFAULT_DATA_DIR = REPO_ROOT / "data" / "seeds"


class DSConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="LANDMAP_",
        env_file=str(REPO_ROOT / ".env"),
        extra="ignore",
    )

    database_url: str | None = None
    duckdb_path: Path = Path(".cache/landmap.duckdb")
    data_dir: Path = DEFAULT_DATA_DIR
    log_level: str = "INFO"

    @property
    def duckdb_abs(self) -> Path:
        p = self.duckdb_path
        return p if p.is_absolute() else (REPO_ROOT / "python" / p)


@lru_cache
def get_config() -> DSConfig:
    return DSConfig()
