"""Tests for the real-data-trained PyTorch refiner.

These only run when torch is installed AND trained artifacts exist
(``artifacts/refiner.pt``, produced by ``python -m landmap_serving.train_refiner``).
They verify the trained engine loads, stays inside the bounded correction band,
and produces sane, finite prices.
"""

from __future__ import annotations

import json

import pytest

from landmap_serving.realtime import (
    REFINER_BOUND,
    RealtimeValuator,
    artifacts_dir,
)

torch = pytest.importorskip("torch")

_ARTIFACT = artifacts_dir() / "refiner.pt"
requires_artifact = pytest.mark.skipif(
    not _ARTIFACT.exists(), reason="trained refiner artifact not present"
)


@requires_artifact
def test_trained_weights_load():
    rt = RealtimeValuator()
    assert rt.torch_available is True
    assert rt.refiner_trained is True


@requires_artifact
def test_refiner_multiplier_within_bounds():
    rt = RealtimeValuator()
    v = rt.value(area_m2=300.0, type_="terreno", base_ppm2=4200.0, engine="torch")
    assert v.engine == "torch"
    assert v.predicted_price > 0
    lo, hi = 1.0 - REFINER_BOUND - 1e-6, 1.0 + REFINER_BOUND + 1e-6
    assert lo <= v.refiner_multiplier <= hi


@requires_artifact
def test_auto_engine_uses_torch_when_trained():
    rt = RealtimeValuator()
    v = rt.value(area_m2=200.0, type_="apartamento", base_ppm2=6000.0, engine="auto")
    assert v.engine == "torch"


@requires_artifact
def test_metrics_report_is_valid():
    metrics = json.loads((artifacts_dir() / "refiner_metrics.json").read_text("utf-8"))
    assert metrics["rows"] > 0
    # Training must not worsen the price-space error vs the prior-only baseline.
    assert metrics["refinedMdapePct"] <= metrics["priorMdapePct"] + 1e-6
