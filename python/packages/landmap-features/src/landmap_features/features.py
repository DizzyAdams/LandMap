"""Turn raw properties + price history into model-ready features with polars."""

from __future__ import annotations

import polars as pl


def build_features(properties: pl.DataFrame, price_history: pl.DataFrame) -> pl.DataFrame:
    """Enrich properties with price/m², YoY and volatility derived from price history."""
    props = properties.with_columns(
        (pl.col("price") / pl.col("areaM2")).alias("price_per_m2")
    )

    if price_history.height > 0 and "property_id" in price_history.columns:
        ph = price_history.sort(["property_id", "date"]).with_columns(
            (pl.col("price") / pl.col("price").first().over("property_id") - 1).alias("ret")
        )
        agg = ph.group_by("property_id").agg(
            (((pl.col("price").last() / pl.col("price").first()) - 1) * 100).alias("yoy_pct"),
            pl.col("ret").std().alias("volatility"),
            pl.len().alias("n_price_obs"),
        )
        props = props.join(agg, on="property_id", how="left")
    else:
        props = props.with_columns(
            pl.lit(None).cast(pl.Float64).alias("yoy_pct"),
            pl.lit(None).cast(pl.Float64).alias("volatility"),
        )

    props = props.with_columns(
        (pl.col("modality") == "lancamento").alias("is_launch"),
        (pl.col("type") == "apartamento").alias("is_apt"),
    )
    return props


def city_index(features: pl.DataFrame) -> pl.DataFrame:
    """Aggregate features into a per-city market index (used for benchmarking)."""
    return (
        features.group_by("city", "state")
        .agg(
            pl.col("price_per_m2").mean().alias("city_price_per_m2"),
            pl.col("price_per_m2").median().alias("city_median_per_m2"),
            pl.col("yoy_pct").mean().alias("city_yoy_pct"),
            pl.len().alias("n_properties"),
        )
        .sort("city_price_per_m2", descending=True)
    )
