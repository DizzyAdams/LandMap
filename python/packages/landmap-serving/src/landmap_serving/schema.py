"""Request/response contracts for the valuation service (camelCase wire format)."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class ValueRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    area_m2: float
    city: str
    state: str
    type: str = "apartamento"
    modality: str = "venda"
    bedrooms: int | None = None
    price_per_m2: float | None = None
    yoy_pct: float | None = None
    volatility: float | None = None
    is_launch: bool = False


class ValueResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    predicted_price: float
    price_per_m2_estimate: float


class ForecastRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    city: str
    periods: int = 12


class ForecastPoint(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    horizon: int
    forecast_price: float


class ForecastResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    city: str
    forecasts: list[ForecastPoint]
