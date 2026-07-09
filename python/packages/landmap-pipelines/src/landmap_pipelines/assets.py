"""Dagster assets composing the LandMap DS pipeline."""

from __future__ import annotations

import polars as pl

from dagster import asset

from landmap_data.datasets import load_price_history, load_properties
from landmap_data.ingest import ingest_properties
from landmap_features.features import build_features, city_index
from landmap_features.schema import FeatureStore
from landmap_models.forecast import CityForecaster
from landmap_models.valuation import ValuationModel

from .resources import DuckDBResource, MLflowResource


@asset
def raw_properties(duck: DuckDBResource) -> str:
    conn = duck.get_connection()
    try:
        ingest_properties(conn=conn)
        return "ingested"
    finally:
        conn.close()


@asset
def feature_table(raw_properties: str, duck: DuckDBResource) -> pl.DataFrame:
    conn = duck.get_connection()
    try:
        props = load_properties(conn=conn)
        ph = load_price_history(conn=conn)
        feats = build_features(props, ph)
        FeatureStore(conn=conn).write(feats, "features")
        return feats
    finally:
        conn.close()


@asset
def city_market_index(feature_table: pl.DataFrame) -> pl.DataFrame:
    return city_index(feature_table)


@asset
def valuation_model(feature_table: pl.DataFrame, mlflow: MLflowResource) -> ValuationModel:
    mlflow.get_client()
    import mlflow.sklearn

    model = ValuationModel().fit(feature_table)
    with mlflow.start_run(run_name="valuation"):
        mlflow.sklearn.log_model(model.estimator, "model")
        mlflow.log_metric("n_features", len(model.feature_cols))
    return model


@asset
def city_forecasts(duck: DuckDBResource) -> pl.DataFrame:
    conn = duck.get_connection()
    try:
        ph = load_price_history(conn=conn)
        return CityForecaster().fit_predict(ph)
    finally:
        conn.close()
