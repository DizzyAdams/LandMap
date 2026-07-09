"""Dagster Definitions: assets + resources + daily schedule."""

from __future__ import annotations

from dagster import Definitions, ScheduleDefinition, define_asset_job

from .assets import (
    city_forecasts,
    city_market_index,
    feature_table,
    raw_properties,
    valuation_model,
)
from .resources import DuckDBResource, MLflowResource

duck = DuckDBResource()
mlflow = MLflowResource()

all_assets_job = define_asset_job(name="all_assets_job", selection="*")

defs = Definitions(
    assets=[raw_properties, feature_table, city_market_index, valuation_model, city_forecasts],
    resources={"duck": duck, "mlflow": mlflow},
    jobs=[all_assets_job],
    schedules=[
        ScheduleDefinition(
            name="daily_ds",
            job=all_assets_job,
            cron_schedule="0 5 * * *",
        )
    ],
)
