"""Property valuation model (price prediction).

Default estimator is scikit-learn `HistGradientBoostingRegressor` — production-grade,
handles mixed features, scales well. Swap to XGBoost/LightGBM by passing `estimator=`
(see commented extras in pyproject.toml).
"""

from __future__ import annotations

import pickle
from pathlib import Path

import polars as pl
from sklearn.ensemble import HistGradientBoostingRegressor

# Columns the model consumes; only those present in the frame are used.
FEATURES = [
    "areaM2",
    "price_per_m2",
    "yoy_pct",
    "volatility",
    "is_launch",
    "is_apt",
    "bedrooms",
]


class ValuationModel:
    def __init__(self, estimator=None):
        self.estimator = estimator or HistGradientBoostingRegressor(
            max_iter=200, learning_rate=0.05, random_state=42
        )
        self.feature_cols: list[str] = []

    def fit(self, features: pl.DataFrame) -> "ValuationModel":
        df = features.to_pandas()
        self.feature_cols = [c for c in FEATURES if c in df.columns]
        if not self.feature_cols:
            raise ValueError("No known valuation features found in the frame.")
        x = df[self.feature_cols].fillna(0)
        y = df["price"].fillna(df["price"].mean())
        self.estimator.fit(x, y)
        return self

    def predict(self, features: pl.DataFrame) -> list[float]:
        df = features.to_pandas()
        x = df[self.feature_cols].fillna(0)
        return [float(v) for v in self.estimator.predict(x)]

    def save(self, path: str | Path) -> None:
        Path(path).write_bytes(pickle.dumps(self))

    @classmethod
    def load(cls, path: str | Path) -> "ValuationModel":
        return pickle.loads(Path(path).read_bytes())
