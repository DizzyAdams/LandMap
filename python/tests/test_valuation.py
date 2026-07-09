import math

import polars as pl

from landmap_models.valuation import ValuationModel


def test_valuation_fit_predict():
    feats = pl.DataFrame(
        {
            "property_id": [str(i) for i in range(20)],
            "price": [500000.0 + i * 10000 for i in range(20)],
            "areaM2": [80.0 + i for i in range(20)],
            "price_per_m2": [6000.0 + i * 50 for i in range(20)],
            "yoy_pct": [5.0 + (i % 3) for i in range(20)],
            "volatility": [0.02 + (i % 4) * 0.01 for i in range(20)],
            "is_launch": [i % 2 == 0 for i in range(20)],
            "is_apt": [i % 2 == 1 for i in range(20)],
            "bedrooms": [i % 4 for i in range(20)],
        }
    )
    model = ValuationModel().fit(feats)
    assert model.feature_cols  # non-empty
    preds = model.predict(feats)
    assert len(preds) == 20
    assert all(pred == pred and pred > 0 for pred in preds)  # no NaN, positive
    assert math.isfinite(model.predict(feats)[0])
