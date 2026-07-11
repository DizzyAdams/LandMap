"""Tests for the ultra-low-latency real-time valuator (numpy hot path)."""

from __future__ import annotations

import math

from landmap_serving.realtime import RealtimeValuator, get_realtime_valuator


def test_singleton_is_stable():
    a = get_realtime_valuator()
    b = get_realtime_valuator()
    assert a is b


def test_numpy_engine_always_available():
    rt = RealtimeValuator()
    v = rt.value(area_m2=250.0, type_="apartamento", base_ppm2=6000.0, engine="numpy")
    assert v.engine == "numpy"
    assert v.predicted_price > 0
    assert v.price_per_m2 > 0
    assert math.isfinite(v.predicted_price)
    # latency telemetry present and sane (well under a millisecond on numpy path)
    assert v.latency_us >= 0.0
    assert v.refiner_multiplier == 1.0  # no torch refiner in numpy engine


def test_price_scales_with_area():
    rt = RealtimeValuator()
    small = rt.value(area_m2=100.0, base_ppm2=6000.0, engine="numpy")
    big = rt.value(area_m2=1000.0, base_ppm2=6000.0, engine="numpy")
    assert big.predicted_price > small.predicted_price


def test_type_multipliers_ordering():
    rt = RealtimeValuator()
    kw = dict(area_m2=300.0, base_ppm2=6000.0, engine="numpy")
    terreno = rt.value(type_="terreno", **kw).price_per_m2
    apto = rt.value(type_="apartamento", **kw).price_per_m2
    comercial = rt.value(type_="comercial", **kw).price_per_m2
    # terreno cheaper per m², comercial pricier — matches calibrated priors
    assert terreno < apto < comercial


def test_launch_and_yoy_increase_value():
    rt = RealtimeValuator()
    base = rt.value(area_m2=200.0, base_ppm2=6000.0, engine="numpy").price_per_m2
    launched = rt.value(
        area_m2=200.0, base_ppm2=6000.0, is_launch=True, engine="numpy"
    ).price_per_m2
    appreciating = rt.value(
        area_m2=200.0, base_ppm2=6000.0, yoy_pct=0.2, engine="numpy"
    ).price_per_m2
    assert launched > base
    assert appreciating > base


def test_batch_valuation():
    rt = RealtimeValuator()
    rows = [
        {"area_m2": 120.0, "type_": "apartamento", "base_ppm2": 6000.0},
        {"area_m2": 500.0, "type_": "terreno", "base_ppm2": 4000.0},
        {"area_m2": 300.0, "type_": "comercial", "base_ppm2": 8000.0},
    ]
    out = rt.value_batch(rows, engine="numpy")
    assert len(out) == 3
    assert all(v.predicted_price > 0 for v in out)


def test_defaults_when_no_base_ppm2():
    rt = RealtimeValuator()
    v = rt.value(area_m2=250.0, engine="numpy")
    assert v.predicted_price > 0  # falls back to DEFAULT_PPM2, no crash
