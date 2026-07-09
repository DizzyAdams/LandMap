"""Load (lazily training if absent) the valuation model."""

from __future__ import annotations

from pathlib import Path

from landmap_data.datasets import load_price_history, load_properties
from landmap_features.features import build_features
from landmap_models.valuation import ValuationModel

MODEL_PATH = Path(".cache/valuation.pkl")


def get_valuation_model() -> ValuationModel:
    if MODEL_PATH.exists():
        return ValuationModel.load(MODEL_PATH)
    props = load_properties()
    ph = load_price_history()
    feats = build_features(props, ph)
    model = ValuationModel().fit(feats)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    model.save(MODEL_PATH)
    return model
