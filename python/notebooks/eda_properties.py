import marimo

__generated_with = "0.9.0"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    import polars as pl
    from landmap_data.datasets import load_price_history, load_properties
    from landmap_features.features import build_features, city_index
    return mo, pl, load_price_history, load_properties, build_features, city_index


@app.cell
def _(load_properties, load_price_history, build_features, mo):
    props = load_properties()
    ph = load_price_history()
    feats = build_features(props, ph)
    mo.md(
        f"## LandMap EDA\n\n"
        f"- **{props.height}** imóveis\n"
        f"- **{ph.height}** pontos de série de preço\n"
        f"- **{feats.height}** linhas de features"
    )
    return props, ph, feats


@app.cell
def _(feats, city_index, mo):
    mo.ui.table(city_index(feats).to_pandas())
    return


if __name__ == "__main__":
    app.run()
