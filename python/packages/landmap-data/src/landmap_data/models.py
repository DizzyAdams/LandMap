"""Pydantic models mirroring the JSON seed contract (Property + PriceHistory)."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class PricePoint(BaseModel):
    date: datetime
    price: float


class Property(BaseModel):
    id: str
    title: str
    type: str
    modality: str
    city: str
    state: str
    areaM2: float
    price: float
    bedrooms: int | None = None
    available: bool = True
    status: str = "active"
    latitude: float | None = None
    longitude: float | None = None
    neighborhood: str | None = None
    zone: str | None = None
    priceHistory: list[PricePoint] = Field(default_factory=list)
