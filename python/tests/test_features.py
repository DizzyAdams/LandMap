import polars as pl

from landmap_features.features import build_features, city_index


def test_build_features_basic():
    props = pl.DataFrame(
        {
            "property_id": ["1", "2"],
            "price": [600000.0, 800000.0],
            "areaM2": [100.0, 200.0],
            "modality": ["venda", "lancamento"],
            "type": ["apartamento", "casa"],
            "bedrooms": [2, 3],
            "city": ["Floripa", "Floripa"],
            "state": ["SC", "SC"],
        }
    )
    ph = pl.DataFrame(
        {
            "property_id": ["1", "1", "2"],
            "date": ["2024-01-01", "2024-06-01", "2024-01-01"],
            "price": [580000.0, 620000.0, 780000.0],
        }
    ).with_columns(pl.col("date").str.to_datetime())

    feats = build_features(props, ph)
    assert "price_per_m2" in feats.columns
    assert feats["price_per_m2"][0] == 6000.0
    assert "yoy_pct" in feats.columns
    assert feats["yoy_pct"][0] > 0

    idx = city_index(feats)
    assert idx.height >= 1
    assert "city_price_per_m2" in idx.columns
