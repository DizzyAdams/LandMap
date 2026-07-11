"""Train the PyTorch refiner on the real LandMap dataset.

The real-time valuator prices a request with a fast, deterministic numpy prior
(``landmap_serving.realtime``) and then multiplies it by a small, bounded
correction produced by a tiny MLP — the *refiner*. This script fits that refiner
on the real seed data (properties + price history) so the correction reflects
the actual market instead of staying at the near-identity safe default.

Method
------
1. Load the real seed (``data/seeds/properties.json``).
2. Derive the same features the runtime uses (``FEATURE_NAMES``), plus per-city
   / per-type median ``price_per_m2`` used as the request ``base_ppm2`` (exactly
   what the web UI passes as ``kpis.avgPriceM2``).
3. Compute the numpy prior price for each row and the residual multiplier
   ``true_price / prior_price``.
4. Fit the MLP so ``1 + BOUND * tanh(net(x))`` matches the (clipped) residual.
5. Persist ``artifacts/refiner.pt`` + ``artifacts/refiner_metrics.json``.

Run: ``python -m landmap_serving.train_refiner`` (torch required).
"""

from __future__ import annotations

import json
import time
from pathlib import Path

import numpy as np

from .realtime import (
    _REF_AREA,
    _TYPE_MULT,
    DEFAULT_PPM2,
    FEATURE_NAMES,
    REFINER_BOUND,
    _features,
    artifacts_dir,
)

try:
    import torch
    from torch import nn
except Exception as exc:  # pragma: no cover - script requires torch
    raise SystemExit(
        "PyTorch is required to train the refiner. Install with:\n"
        "  uv pip install torch --index-url https://download.pytorch.org/whl/cpu"
    ) from exc


REPO_ROOT = Path(__file__).resolve().parents[5]
SEED = REPO_ROOT / "data" / "seeds" / "properties.json"


def _prior_ppm2(area_m2: float, type_: str, is_launch: bool, yoy: float,
                vol: float, bedrooms: int, base_ppm2: float) -> float:
    """Numpy calibrated prior — identical math to ``RealtimeValuator.value``."""
    tmult = _TYPE_MULT.get(type_, 1.0)
    launch_mult = 1.08 if is_launch else 1.0
    yoy_mult = 1.0 + float(np.clip(yoy, -0.5, 0.5)) * 0.30
    vol_penalty = 1.0 - float(np.clip(vol, 0.0, 1.0)) * 0.05
    area_eff = float((max(area_m2, 1.0) / _REF_AREA) ** -0.03)
    bed_bonus = 1.0 + min(int(bedrooms), 6) * 0.01
    return base_ppm2 * tmult * launch_mult * yoy_mult * vol_penalty * area_eff * bed_bonus


def load_dataset() -> tuple[np.ndarray, np.ndarray, dict]:
    """Return (X features, y residual-multiplier, meta) built from the seed."""
    raw = json.loads(SEED.read_text(encoding="utf-8"))

    buckets: dict[tuple[str, str], list[float]] = {}
    for p in raw:
        area = float(p.get("areaM2") or 0)
        price = float(p.get("price") or 0)
        if area <= 0 or price <= 0:
            continue
        key = (p.get("city", ""), p.get("type", "apartamento"))
        buckets.setdefault(key, []).append(price / area)
    base_by_key = {k: float(np.median(v)) for k, v in buckets.items() if v}

    feats: list[np.ndarray] = []
    residuals: list[float] = []
    true_prices: list[float] = []
    prior_prices: list[float] = []
    priced = 0
    for p in raw:
        area = float(p.get("areaM2") or 0)
        price = float(p.get("price") or 0)
        if area <= 0 or price <= 0:
            continue
        type_ = p.get("type", "apartamento")
        is_launch = p.get("modality") == "lancamento"
        bedrooms = int(p.get("bedrooms") or 0)

        hist = [float(h["price"]) for h in p.get("priceHistory", []) if h.get("price")]
        if len(hist) >= 2:
            yoy = hist[-1] / hist[0] - 1.0
            rets = np.diff(hist) / np.array(hist[:-1])
            vol = float(np.std(rets)) if rets.size else 0.0
        else:
            yoy, vol = 0.0, 0.0

        base = base_by_key.get((p.get("city", ""), type_), DEFAULT_PPM2)
        prior_price = _prior_ppm2(area, type_, is_launch, yoy, vol, bedrooms, base) * area
        if prior_price <= 0:
            continue

        feats.append(_features(area, type_, is_launch, yoy, vol, bedrooms, base))
        residuals.append(price / prior_price)
        true_prices.append(price)
        prior_prices.append(prior_price)
        priced += 1

    X = np.stack(feats).astype(np.float32)
    y = np.asarray(residuals, dtype=np.float32)
    meta = {
        "n_rows": priced,
        "n_buckets": len(base_by_key),
        "true_price": np.asarray(true_prices, dtype=np.float64),
        "prior_price": np.asarray(prior_prices, dtype=np.float64),
    }
    return X, y, meta


def _mdape(pred: np.ndarray, true: np.ndarray) -> float:
    """Median absolute percentage error — robust to the fat tails in real prices."""
    mask = true != 0
    return float(np.median(np.abs((pred[mask] - true[mask]) / true[mask])) * 100)



def train(epochs: int = 400, lr: float = 0.01, seed: int = 42) -> dict:
    torch.manual_seed(seed)
    np.random.seed(seed)

    X, y_resid, meta = load_dataset()
    mu = X.mean(axis=0)
    sd = X.std(axis=0)
    sd[sd == 0] = 1.0
    Xn = (X - mu) / sd

    lo, hi = 1.0 - REFINER_BOUND, 1.0 + REFINER_BOUND
    y_clip = np.clip(y_resid, lo, hi)

    xt = torch.from_numpy(Xn)
    yt = torch.from_numpy(y_clip).reshape(-1, 1)

    net = nn.Sequential(
        nn.Linear(len(FEATURE_NAMES), 16),
        nn.GELU(),
        nn.Linear(16, 1),
    )
    opt = torch.optim.Adam(net.parameters(), lr=lr, weight_decay=1e-4)
    loss_fn = nn.MSELoss()

    t0 = time.perf_counter()
    net.train()
    loss = torch.tensor(0.0)
    for _ in range(epochs):
        opt.zero_grad()
        raw = net(xt)
        mult = 1.0 + REFINER_BOUND * torch.tanh(raw)
        loss = loss_fn(mult, yt)
        loss.backward()
        opt.step()
    train_s = time.perf_counter() - t0
    net.eval()

    with torch.inference_mode():
        mult_pred = (1.0 + REFINER_BOUND * torch.tanh(net(xt))).numpy().ravel()

    # Business metric: error in *price* space, prior-only vs refined (robust MdAPE).
    true_price = meta["true_price"]
    prior_price = meta["prior_price"]
    refined_price = prior_price * mult_pred
    prior_mape = _mdape(prior_price, true_price)
    refined_mape = _mdape(refined_price, true_price)

    out = artifacts_dir()
    out.mkdir(parents=True, exist_ok=True)
    torch.save(
        {
            "state_dict": net.state_dict(),
            "feature_mean": mu.tolist(),
            "feature_std": sd.tolist(),
            "bound": REFINER_BOUND,
            "feature_names": list(FEATURE_NAMES),
        },
        out / "refiner.pt",
    )
    metrics = {
        "rows": meta["n_rows"],
        "buckets": meta["n_buckets"],
        "epochs": epochs,
        "lr": lr,
        "trainSeconds": round(train_s, 3),
        "finalLoss": round(float(loss.item()), 6),
        "priorMdapePct": round(prior_mape, 3),
        "refinedMdapePct": round(refined_mape, 3),
        "improvementPct": round(prior_mape - refined_mape, 3),
        "multiplierMin": round(float(mult_pred.min()), 5),
        "multiplierMax": round(float(mult_pred.max()), 5),
        "multiplierMean": round(float(mult_pred.mean()), 5),
    }
    (out / "refiner_metrics.json").write_text(
        json.dumps(metrics, indent=2), encoding="utf-8"
    )
    return metrics


def main() -> None:
    m = train()
    print("Refiner trained on real data:")
    for k, v in m.items():
        print(f"  {k:>16}: {v}")
    print(f"\nArtifacts written to: {artifacts_dir()}")


if __name__ == "__main__":
    main()
