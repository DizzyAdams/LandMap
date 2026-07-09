# LandMap Data Science (`python/`)

Infraestrutura de ciência de dados do LandMap, integrada ao monorepo pnpm.
Workspace Python gerenciado por **uv** (espelha o `pnpm-workspace.yaml`).

## Stack

| Camada            | Tecnologia (best-in-class)                                  |
| ----------------- | ----------------------------------------------------------- |
| Storage/Analytics | **DuckDB** (warehouse zero-infra, Parquet) + Postgres       |
| Ingestão          | `landmap-data` (psycopg + DuckDB)                           |
| Feature store     | `landmap-features` (**polars**) → tabela `features` no DuckDB |
| Modelagem         | `landmap-models` (**scikit-learn** HistGBM + **statsmodels**) |
| Orquestração      | `landmap-pipelines` (**Dagster**)                           |
| Tracking          | **MLflow**                                                  |
| Serving           | `landmap-serving` (**FastAPI**) — `/value`, `/forecast`     |
| Notebooks/EDA     | **JupyterLab** + **Marimo**                                |
| Qualidade         | `ruff` + `mypy` + `pytest`                                  |

> Upgrades point-for-point documentados no código: `xgboost`/`lightgbm` (valuation),
> `statsforecast`/`prophet` (forecast). Basta descomentar no `pyproject.toml`.

## Quickstart

```bash
cd python
uv sync                      # instala tudo (editable workspace)
uv run pytest                # testes da features + models
uv run python -m landmap_pipelines.definitions   # valida definições Dagster
uv run dagster dev -m landmap_pipelines.definitions   # UI de orquestração
uv run fastapi dev landmap_serving/main.py     # API de valuation
```

Os dados vêm de `../data/seeds/properties.json` (imóveis + `priceHistory`). Se
`LANDMAP_DATABASE_URL` estiver definido, a ingestão também lê do Postgres.
