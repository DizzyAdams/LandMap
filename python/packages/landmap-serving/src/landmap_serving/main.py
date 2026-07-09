"""FastAPI app exposing `/value` (valuation) and `/forecast` (city trend)."""

from __future__ import annotations

import polars as pl
from fastapi import FastAPI, HTTPException

from landmap_data.datasets import load_price_history
from landmap_models.forecast import CityForecaster

from .model_store import get_valuation_model
from .schema import (
    ForecastPoint,
    ForecastRequest,
    ForecastResponse,
    ValueRequest,
    ValueResponse,
)

app = FastAPI(title="LandMap Valuation Service", version="0.1.0")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/value", response_model=ValueResponse)
def value(req: ValueRequest) -> ValueResponse:
    model = get_valuation_model()
    # Build the exact feature row the model was trained on (derived flags included).
    row = pl.DataFrame(
        [
            {
                "areaM2": req.areaM2,
                "price_per_m2": req.price_per_m2 or 0.0,
                "yoy_pct": req.yoy_pct or 0.0,
                "volatility": req.volatility or 0.0,
                "is_launch": req.is_launch,
                "is_apt": req.type == "apartamento",
                "bedrooms": req.bedrooms or 0,
            }
        ]
    )
    preds = model.predict(row)
    predicted = preds[0] if preds else 0.0
    ppm2 = predicted / req.areaM2 if req.areaM2 else 0.0
    return ValueResponse(predicted_price=predicted, price_per_m2_estimate=ppm2)


@app.post("/forecast", response_model=ForecastResponse)
def forecast(req: ForecastRequest) -> ForecastResponse:
    ph = load_price_history()
    fc = CityForecaster(periods=req.periods).fit_predict(ph)
    sub = fc.filter(pl.col("city") == req.city)
    if sub.height == 0:
        raise HTTPException(status_code=404, detail=f"No forecast for city {req.city!r}")
    points = [
        ForecastPoint(horizon=int(r["horizon"]), forecast_price=float(r["forecast_price"]))
        for r in sub.iter_rows(named=True)
    ]
    return ForecastResponse(city=req.city, forecasts=points)
