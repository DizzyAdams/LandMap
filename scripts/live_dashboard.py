"""
LandMap — Live Market Dashboard (Streamlit)

Conecta-se à API REST do LandMap (Hono) e exibe métricas de mercado em tempo real:
  - /stats     estatísticas gerais (total de imóveis, cidades, preço médio,
               breakdown por tipo e modalidade)
  - /cities    agregação por cidade (contagem + preço médio)
  - /compare   comparação de 2+ imóveis por IDs

Execução local (após `pnpm dev:api`, porta 4000):
    pip install streamlit requests
    streamlit run scripts/live_dashboard.py

Nenhuma chamada externa de LLM/provider é feita — somente HTTP para a API local.
Isso mantém o dashboard 100% local-first e sem risco de erro de provider.
"""

from __future__ import annotations

import os
from typing import Any

import requests
import streamlit as st

DEFAULT_BASE = os.getenv("LANDMAP_API_URL", "http://localhost:4000")
TIMEOUT = 5


def fetch_json(path: str, base: str, params: dict | None = None) -> Any | None:
    """GET JSON from the LandMap API; returns None on any connection error."""
    try:
        resp = requests.get(f"{base}{path}", params=params, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as exc:
        st.error(f"Falha ao acessar {base}{path}: {exc}")
        return None


def fmt_brl(value: float) -> str:
    try:
        return (
            f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        )
    except Exception:
        return str(value)


def main() -> None:
    st.set_page_config(page_title="LandMap · Live", layout="wide")
    st.title("🏙️ LandMap — Live Market Dashboard")

    base = st.sidebar.text_input("API base URL", DEFAULT_BASE)
    st.sidebar.caption("Inicie a API com `pnpm dev:api` (porta 4000).")

    stats = fetch_json("/stats", base)
    if stats:
        col1, col2, col3 = st.columns(3)
        col1.metric("Imóveis", stats.get("totalProperties", 0))
        col2.metric("Cidades", stats.get("totalCities", 0))
        col3.metric("Preço médio", fmt_brl(stats.get("avgPrice", 0)))

        c1, c2 = st.columns(2)
        with c1:
            st.subheader("Por tipo")
            st.json(stats.get("byType", {}))
        with c2:
            st.subheader("Por modalidade")
            st.json(stats.get("byModality", {}))

    cities = fetch_json("/cities", base)
    if cities and "items" in cities:
        st.subheader("Agregação por cidade")
        st.dataframe(
            [
                {
                    "Cidade": c["city"],
                    "Estado": c["state"],
                    "Imóveis": c["count"],
                    "Preço médio": fmt_brl(c["avgPrice"]),
                }
                for c in cities["items"]
            ]
        )

    st.subheader("Comparar imóveis")
    ids_input = st.text_input("IDs (separados por vírgula)", "1,2")
    if st.button("Comparar"):
        ids = [i.strip() for i in ids_input.split(",") if i.strip()]
        compare = fetch_json("/compare", base, params={"ids": ",".join(ids)})
        if compare is not None:
            st.json(compare)


if __name__ == "__main__":
    main()
