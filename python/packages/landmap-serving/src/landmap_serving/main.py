"""FastAPI app exposing `/value`, `/forecast`, and `/inspect/image`."""

from __future__ import annotations

from contextlib import asynccontextmanager
from io import BytesIO
from typing import Any

import numpy as np
import polars as pl
from fastapi import FastAPI, File, Form, HTTPException, UploadFile

from landmap_data.datasets import load_price_history
from landmap_models.forecast import CityForecaster

from .model_store import get_valuation_model
from .realtime import get_realtime_valuator
from .schema import (
    ForecastPoint,
    ForecastRequest,
    ForecastResponse,
    InspectionAnalysisResponse,
    RealtimeBatchRequest,
    RealtimeBatchResponse,
    RealtimeValueRequest,
    RealtimeValueResponse,
    ValueRequest,
    ValueResponse,
)

try:  # pragma: no cover - optional vision dependency
    import cv2  # type: ignore
except Exception:  # pragma: no cover - fallback path
    cv2 = None  # type: ignore[assignment]

from PIL import Image

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


def _inspect_array(image: np.ndarray) -> dict[str, Any]:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if cv2 is not None else image.mean(axis=2).astype(np.uint8)
    if gray.ndim != 2:
        raise ValueError("Invalid grayscale conversion")
    brightness = float(gray.mean())
    contrast = float(gray.std())

    if cv2 is not None:
        lap = cv2.Laplacian(gray, cv2.CV_64F)
        focus_score = float(lap.var())
        edges = cv2.Canny(gray, 80, 180)
        edges_ratio = float(edges.mean() / 255.0)
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        hist = cv2.calcHist([rgb], [0, 1, 2], None, [4, 4, 4], [0, 256, 0, 256, 0, 256]).flatten()
        dominant = int(hist.argmax())
        r = (dominant // 16) * 64
        g = ((dominant // 4) % 4) * 64
        b = (dominant % 4) * 64
    else:
        focus_score = float(np.abs(np.diff(gray.astype(np.float32), axis=0)).mean() if gray.shape[0] > 1 else 0.0)
        gx = np.abs(np.diff(gray.astype(np.float32), axis=1)).mean() if gray.shape[1] > 1 else 0.0
        edges_ratio = float((focus_score + gx) / 255.0)
        rgb = image[:, :, ::-1]
        r, g, b = (int(x) for x in rgb.mean(axis=(0, 1)))

    score = int(
        np.clip(
            100
            - abs(brightness - 130) * 1.0
            + min(20.0, contrast * 0.65)
            + min(20.0, focus_score * 0.05)
            - max(0.0, (0.04 - edges_ratio) * 250.0),
            0,
            100,
        )
    )
    notes: list[str] = []
    if brightness < 60:
        notes.append("Pouca luz")
    if brightness > 200:
        notes.append("Imagem muito clara")
    if contrast < 25:
        notes.append("Pouco contraste")
    if focus_score < 120:
        notes.append("Foco fraco")
    if not notes:
        notes.append("Imagem apta para underwriting")

    verdict = "boa" if score >= 75 else "ok" if score >= 55 else "ruim"
    return {
        "brightness": int(round(brightness)),
        "contrast": int(round(contrast)),
        "sharpness": int(round(min(100.0, focus_score / 8.0))),
        "score": score,
        "verdict": verdict,
        "notes": notes,
        "dominant_color": f"rgb({r}, {g}, {b})",
        "edges_ratio": round(edges_ratio, 4),
        "focus_score": round(focus_score, 2),
    }


@app.post("/inspect/image", response_model=InspectionAnalysisResponse)
async def inspect_image(
    image: UploadFile = File(...),
    max_width: int = Form(1024),
) -> InspectionAnalysisResponse:
    """Analyze a property photo using the Python vision backend."""
    raw = await image.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty image upload")

    try:
        pil = Image.open(BytesIO(raw)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid image upload") from exc

    width, height = pil.size
    if width > max_width:
        new_height = max(1, round(height * (max_width / width)))
        pil = pil.resize((max_width, new_height))
        width, height = pil.size

    rgb = np.asarray(pil, dtype=np.uint8)
    if cv2 is not None:
        metrics = _inspect_array(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR))
    else:
        # Fallback keeps the endpoint useful in environments without the OpenCV wheel.
        metrics = _inspect_array(rgb[:, :, ::-1])
    return InspectionAnalysisResponse(
        image_width=width,
        image_height=height,
        **metrics,
    )
