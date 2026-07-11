"""FastAPI app exposing `/value` (valuation) and `/forecast` (city trend)."""

from __future__ import annotations

from contextlib import asynccontextmanager

import polars as pl
from fastapi import FastAPI, HTTPException

from landmap_data.datasets import load_price_history
from landmap_models.forecast import CityForecaster

from .model_store import get_valuation_model
from .realtime import get_realtime_valuator
from .schema import (
    ForecastPoint,
    ForecastRequest,
    ForecastResponse,
    RealtimeBatchRequest,
    RealtimeBatchResponse,
    RealtimeValueRequest,
    RealtimeValueResponse,
    ValueRequest,
    ValueResponse,
)

@asynccontextmanager
async def lifespan(_: FastAPI):
    # Build + warm the real-time valuator so the first request pays no cold cost.
    get_realtime_valuator()
    yield


app = FastAPI(title="LandMap Valuation Service", version="0.1.0", lifespan=lifespan)


@app.get("/health")
def health() -> dict:
    rt = get_realtime_valuator()
    return {"status": "ok", "torchAvailable": rt.torch_available}


@app.post("/value/realtime", response_model=RealtimeValueResponse)
def value_realtime(req: RealtimeValueRequest) -> RealtimeValueResponse:
    """Single valuation on the numpy/torch hot path — µs latency, warmed model."""
    v = get_realtime_valuator().value(
        area_m2=req.area_m2,
        type_=req.type,
        is_launch=req.is_launch,
        yoy_pct=req.yoy_pct,
        volatility=req.volatility,
        bedrooms=req.bedrooms,
        base_ppm2=req.base_ppm2,
        engine=req.engine,
    )
    return RealtimeValueResponse(
        predicted_price=v.predicted_price,
        price_per_m2=v.price_per_m2,
        engine=v.engine,
        latency_us=v.latency_us,
        refiner_multiplier=v.refiner_multiplier,
    )


@app.post("/value/realtime/batch", response_model=RealtimeBatchResponse)
def value_realtime_batch(req: RealtimeBatchRequest) -> RealtimeBatchResponse:
    """Vectorised batch valuation for throughput dashboards / real-time feeds."""
    rt = get_realtime_valuator()
    rows = [
        {
            "area_m2": it.area_m2,
            "type_": it.type,
            "is_launch": it.is_launch,
            "yoy_pct": it.yoy_pct,
            "volatility": it.volatility,
            "bedrooms": it.bedrooms,
            "base_ppm2": it.base_ppm2,
        }
        for it in req.items
    ]
    results = rt.value_batch(rows, engine=req.engine)
    items = [
        RealtimeValueResponse(
            predicted_price=v.predicted_price,
            price_per_m2=v.price_per_m2,
            engine=v.engine,
            latency_us=v.latency_us,
            refiner_multiplier=v.refiner_multiplier,
        )
        for v in results
    ]
    total = sum(v.latency_us for v in results)
    return RealtimeBatchResponse(
        items=items,
        count=len(items),
        total_latency_us=round(total, 2),
        avg_latency_us=round(total / len(items), 2) if items else 0.0,
        engine=req.engine,
        torch_available=rt.torch_available,
    )


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
