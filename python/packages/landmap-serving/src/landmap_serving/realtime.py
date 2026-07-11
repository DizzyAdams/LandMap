"""Ultra-low-latency real-time property valuation.

Design goals (lowest possible millisecond — actually microsecond — latency):

* **numpy hot path** — the request is turned into a single ``float32`` feature
  vector and priced with vectorised numpy. No pandas / polars on the hot path
  (those allocate and box per-call and cost hundreds of µs). Pure numpy keeps a
  single-item valuation in the tens-of-microseconds range.
* **PyTorch refiner (optional)** — when ``torch`` is installed a tiny MLP runs
  under ``torch.inference_mode()`` with grad disabled and thread count pinned,
  producing a bounded multiplier around 1.0. It is initialised small so the
  model behaves like the calibrated numpy prior until trained (safe defaults).
* **warmup** — the model is built once at import and warmed with a dummy batch
  so the first real request never pays JIT / allocation cost.
* **telemetry** — every response carries ``latency_us`` measured with
  ``time.perf_counter_ns`` so the millisecond budget is observable end-to-end.

The numpy engine is always available; the torch engine is used automatically
when present and selectable per-request.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from pathlib import Path

import numpy as np

# ── Optional PyTorch (never a hard import failure) ──────────────────────────
try:  # pragma: no cover - exercised only when torch is installed
    import torch
    from torch import nn

    _TORCH_OK = True
except Exception:  # ModuleNotFoundError or partial install
    torch = None  # type: ignore[assignment]
    nn = None  # type: ignore[assignment]
    _TORCH_OK = False


# ── Calibration priors (defensible defaults, no training required) ──────────
DEFAULT_PPM2 = 6_000.0
_REF_AREA = 250.0

# Bounded correction the refiner may apply: multiplier ∈ [1-BOUND, 1+BOUND].
REFINER_BOUND = 0.15


def artifacts_dir() -> Path:
    """Directory holding trained artifacts (refiner weights + metrics)."""
    return Path(__file__).resolve().parent / "artifacts"

_TYPE_MULT = {
    "apartamento": 1.00,
    "casa": 0.95,
    "terreno": 0.70,
    "comercial": 1.15,
}

FEATURE_NAMES = (
    "log_area",
    "type_mult",
    "is_launch",
    "yoy",
    "volatility",
    "bedrooms",
    "base_ppm2_k",
)


def _clip(v: float, lo: float, hi: float) -> float:
    return lo if v < lo else hi if v > hi else v


@dataclass(slots=True)
class Valuation:
    predicted_price: float
    price_per_m2: float
    engine: str
    latency_us: float
    refiner_multiplier: float


def _features(
    area_m2: float,
    type_: str,
    is_launch: bool,
    yoy_pct: float,
    volatility: float,
    bedrooms: int,
    base_ppm2: float,
) -> np.ndarray:
    """Build the float32 feature row (numpy, allocation-light)."""
    tmult = _TYPE_MULT.get(type_, 1.0)
    return np.array(
        [
            np.log1p(max(area_m2, 1.0)),
            tmult,
            1.0 if is_launch else 0.0,
            _clip(yoy_pct, -0.5, 0.5),
            _clip(volatility, 0.0, 1.0),
            float(min(bedrooms, 6)),
            base_ppm2 / 1_000.0,
        ],
        dtype=np.float32,
    )


class _TorchRefiner:
    """Tiny bounded MLP: features -> multiplier in ~[0.85, 1.15].

    Initialised near-identity so predictions equal the numpy prior until the
    net is trained. Runs with grad disabled and a pinned single thread for
    deterministic, low-jitter latency.
    """

    def __init__(self) -> None:
        assert _TORCH_OK
        torch.manual_seed(42)
        try:
            torch.set_num_threads(1)  # low jitter for single-item inference
        except Exception:
            pass
        self.net = nn.Sequential(
            nn.Linear(len(FEATURE_NAMES), 16),
            nn.GELU(),
            nn.Linear(16, 1),
        )
        # Shrink the output head so the initial multiplier ≈ 1.0 (safe defaults).
        with torch.no_grad():
            for p in self.net[-1].parameters():
                p.mul_(0.01)
        self.net.eval()
        # Feature standardisation — identity until trained weights are loaded.
        self._mean = np.zeros(len(FEATURE_NAMES), dtype=np.float32)
        self._std = np.ones(len(FEATURE_NAMES), dtype=np.float32)
        self.trained = False
        self._load_trained()

    def _load_trained(self) -> None:
        """Load real-data-trained weights + standardisation when present."""
        path = artifacts_dir() / "refiner.pt"
        if not path.exists():
            return
        try:
            payload = torch.load(path, map_location="cpu", weights_only=True)
            self.net.load_state_dict(payload["state_dict"])
            self.net.eval()
            self._mean = np.asarray(payload["feature_mean"], dtype=np.float32)
            self._std = np.asarray(payload["feature_std"], dtype=np.float32)
            self._std[self._std == 0] = 1.0
            self.trained = True
        except Exception:
            # Corrupt/incompatible artifact -> keep near-identity safe defaults.
            self.trained = False

    def multiplier(self, feats: np.ndarray) -> float:
        z = (np.ascontiguousarray(feats) - self._mean) / self._std
        with torch.inference_mode():
            x = torch.from_numpy(z).float().reshape(1, -1)
            raw = self.net(x).item()
        return 1.0 + REFINER_BOUND * float(np.tanh(raw))


class RealtimeValuator:
    """Singleton valuator with numpy + optional torch engines and warmup."""

    def __init__(self) -> None:
        self._refiner: _TorchRefiner | None = None
        if _TORCH_OK:
            try:
                self._refiner = _TorchRefiner()
            except Exception:
                self._refiner = None
        self.warmup()

    @property
    def torch_available(self) -> bool:
        return self._refiner is not None

    @property
    def refiner_trained(self) -> bool:
        """True when real-data-trained weights were loaded (not safe defaults)."""
        return self._refiner is not None and self._refiner.trained

    def warmup(self) -> None:
        feats = _features(250.0, "apartamento", False, 0.05, 0.1, 2, DEFAULT_PPM2)
        if self._refiner is not None:
            for _ in range(3):
                self._refiner.multiplier(feats)

    def value(
        self,
        *,
        area_m2: float,
        type_: str = "apartamento",
        is_launch: bool = False,
        yoy_pct: float = 0.0,
        volatility: float = 0.0,
        bedrooms: int = 0,
        base_ppm2: float | None = None,
        engine: str = "auto",
    ) -> Valuation:
        t0 = time.perf_counter_ns()
        base = float(base_ppm2) if base_ppm2 and base_ppm2 > 0 else DEFAULT_PPM2
        feats = _features(area_m2, type_, is_launch, yoy_pct, volatility, bedrooms, base)

        # numpy calibrated prior (always available)
        _, tmult, launch, yoy, vol, beds, _ = (float(v) for v in feats)
        launch_mult = 1.08 if launch >= 1.0 else 1.0
        yoy_mult = 1.0 + yoy * 0.30
        vol_penalty = 1.0 - vol * 0.05
        area_eff = float((max(area_m2, 1.0) / _REF_AREA) ** -0.03)
        bed_bonus = 1.0 + min(int(beds), 6) * 0.01
        ppm2 = base * tmult * launch_mult * yoy_mult * vol_penalty * area_eff * bed_bonus

        use_torch = engine in ("auto", "torch") and self._refiner is not None
        mult = 1.0
        if use_torch:
            mult = self._refiner.multiplier(feats)  # type: ignore[union-attr]
            ppm2 *= mult
            engine_used = "torch"
        else:
            engine_used = "numpy"

        predicted = ppm2 * max(area_m2, 0.0)
        latency_us = (time.perf_counter_ns() - t0) / 1_000.0
        return Valuation(
            predicted_price=round(predicted, 2),
            price_per_m2=round(ppm2, 2),
            engine=engine_used,
            latency_us=round(latency_us, 2),
            refiner_multiplier=round(mult, 5),
        )

    def value_batch(self, rows: list[dict], engine: str = "auto") -> list[Valuation]:
        return [self.value(engine=engine, **r) for r in rows]


_SINGLETON: RealtimeValuator | None = None


def get_realtime_valuator() -> RealtimeValuator:
    global _SINGLETON
    if _SINGLETON is None:
        _SINGLETON = RealtimeValuator()
    return _SINGLETON

