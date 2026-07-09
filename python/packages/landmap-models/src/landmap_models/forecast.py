"""City-level price-index forecasting.

Uses statsmodels Holt-Winters (additive trend) per city. For larger volumes, swap to
`statsforecast` (AutoARIMA / ETS) or `prophet` — same `fit_predict` interface.
"""

from __future__ import annotations

import polars as pl
from statsmodels.tsa.holtwinters import ExponentialSmoothing


class CityForecaster:
    def __init__(self, periods: int = 12):
        self.periods = periods
        self.fits: dict[str, list[float]] = {}

    def fit_predict(self, price_history: pl.DataFrame) -> pl.DataFrame:
        ph = price_history.with_columns(
            pl.col("date").dt.truncate("1mo").alias("month")
        )
        city_month = (
            ph.group_by(["city", "month"])
            .agg(pl.col("price").mean().alias("avg_price"))
            .sort(["city", "month"])
        )

        rows: list[dict] = []
        for city in city_month["city"].unique().to_list():
            sub = city_month.filter(pl.col("city") == city).sort("month")
            y = [float(v) for v in sub["avg_price"].to_list()]
            if len(y) < 4:
                fc = (y[-1:] * self.periods) if y else [0.0] * self.periods
            else:
                model = ExponentialSmoothing(y, trend="add", seasonal=None).fit()
                fc = [float(v) for v in model.forecast(self.periods)]
            self.fits[city] = fc
            for i, v in enumerate(fc, 1):
                rows.append({"city": city, "horizon": i, "forecast_price": v})
        return pl.DataFrame(rows)
