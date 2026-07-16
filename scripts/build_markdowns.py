#!/usr/bin/env python3
"""Build 3000 investor-grade markdown dossiers from properties seed (schema v2)."""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

SEEDS_FILE = Path("data/seeds/properties.json")
OUTPUT_DIR = Path("data/markdowns")


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^\w\s\-#]", "", value, flags=re.UNICODE)
    value = re.sub(r"[\s_]+", "-", value)
    return value


def brl(n: float | int) -> str:
    try:
        return f"R$ {float(n):,.0f}".replace(",", "X").replace(".", ",").replace("X", ".")
    except (TypeError, ValueError):
        return "R$ —"


def pct(frac: float, digits: int = 2) -> str:
    try:
        return f"{float(frac) * 100:.{digits}f}%"
    except (TypeError, ValueError):
        return "—"


def yaml_escape(s: str) -> str:
    return str(s).replace('"', '\\"')


def frontmatter(item: dict) -> list[str]:
    inv = item.get("invest") or {}
    market = item.get("market") or {}
    assumptions = item.get("assumptions") or {}
    tags = item.get("tags") or []
    risks = item.get("risks") or []
    drivers = item.get("drivers") or []
    comps = item.get("comps") or []
    thesis = item.get("thesis") or []

    lines = [
        "---",
        f'schemaVersion: {item.get("schemaVersion", 2)}',
        f'kind: "{item.get("kind", "asset")}"',
        f'id: "{yaml_escape(item.get("slugId", item["id"]))}"',
        f'title: "{yaml_escape(item["title"])}"',
        f'city: "{yaml_escape(item["city"])}"',
        f'state: "{yaml_escape(item["state"])}"',
        f'neighborhood: "{yaml_escape(item.get("neighborhood", ""))}"',
        f'type: "{item["type"]}"',
        f'modality: "{item["modality"]}"',
        f'price: {item["price"]}',
        f'areaM2: {item["areaM2"]}',
        f'pricePerM2: {item.get("pricePerM2", 0)}',
        f'latitude: {item.get("latitude", 0)}',
        f'longitude: {item.get("longitude", 0)}',
        f'status: "{item.get("status", "active")}"',
        f'grade: "{item.get("grade", inv.get("grade", "C"))}"',
        f'score: {item.get("score", inv.get("score", 0))}',
        f'capRate: {item.get("capRate", inv.get("capRate", 0))}',
        "tags:",
    ]
    for t in tags:
        lines.append(f'  - "{yaml_escape(t)}"')
    lines.append("risks:")
    for r in risks:
        lines.append(f'  - "{yaml_escape(r)}"')
    lines.append("drivers:")
    for d in drivers:
        lines.append(f'  - "{yaml_escape(d)}"')
    lines.append("comps:")
    for c in comps:
        lines.append(f'  - "{yaml_escape(c)}"')
    lines.append("thesis:")
    for th in thesis:
        lines.append(f'  - "{yaml_escape(th)}"')
    lines += [
        "invest:",
        f'  monthlyRentEstimate: {inv.get("monthlyRentEstimate", 0)}',
        f'  capRate: {inv.get("capRate", 0)}',
        f'  cashOnCash: {inv.get("cashOnCash", 0)}',
        f'  irrPct: {inv.get("irrPct", 0)}',
        f'  totalReturnPct: {inv.get("totalReturnPct", 0)}',
        f'  monthlyCashflow: {inv.get("monthlyCashflow", 0)}',
        f'  score: {inv.get("score", 0)}',
        f'  grade: "{inv.get("grade", "C")}"',
        "assumptions:",
        f'  downPaymentPct: {assumptions.get("downPaymentPct", 0.2)}',
        f'  interestRatePct: {assumptions.get("interestRatePct", 7)}',
        f'  vacancyPct: {assumptions.get("vacancyPct", 0.08)}',
        f'  annualExpensesPct: {assumptions.get("annualExpensesPct", 0.35)}',
        f'  annualAppreciationPct: {assumptions.get("annualAppreciationPct", 0.05)}',
        f'  holdingYears: {assumptions.get("holdingYears", 5)}',
        "market:",
        f'  neighborhoodAvgPricePerM2: {market.get("neighborhoodAvgPricePerM2", 0)}',
        f'  liquidityScore: {market.get("liquidityScore", 0)}',
        f'  demandWeight: {market.get("demandWeight", 0)}',
        f'  appreciationPct: {market.get("appreciationPct", 0)}',
        "disclaimer: \"Dataset sintético calibrado LandMap Free — métricas modelo, não laudo.\"",
        "---",
        "",
    ]
    return lines


def body(item: dict) -> list[str]:
    inv = item.get("invest") or {}
    market = item.get("market") or {}
    assumptions = item.get("assumptions") or {}
    thesis = item.get("thesis") or []
    risks = item.get("risks") or []
    drivers = item.get("drivers") or []
    comps = item.get("comps") or []
    tags = item.get("tags") or []

    grade = inv.get("grade", item.get("grade", "C"))
    score = inv.get("score", item.get("score", 0))

    lines = [
        f"# {item['title']}",
        "",
        f"**{item['type'].title()}** em {item['neighborhood']}, {item['city']}/{item['state']} "
        f"— modalidade **{item['modality']}**. "
        f"Nota de investimento **{grade}** (score {score}/100).",
        "",
        "## Tese de investimento",
        "",
    ]
    for th in thesis:
        lines.append(f"- {th}")
    if not thesis:
        lines.append("- Ativo catalogado no radar LandMap Free com premissas transparentes.")
    lines += [
        "",
        "## Números-chave",
        "",
        "| Métrica | Valor |",
        "|---|---|",
        f"| Preço | {brl(item['price'])} |",
        f"| Área | {item['areaM2']} m² |",
        f"| Preço / m² | {brl(item.get('pricePerM2') or 0)} |",
        f"| Aluguel estimado (mês) | {brl(inv.get('monthlyRentEstimate', 0))} |",
        f"| Cap rate | {pct(inv.get('capRate', 0))} |",
        f"| Cash-on-cash | {pct(inv.get('cashOnCash', 0))} |",
        f"| IRR (modelo) | {pct(inv.get('irrPct', 0))} |",
        f"| ROI total ({assumptions.get('holdingYears', 5)}a) | {inv.get('totalReturnPct', 0)}% |",
        f"| Fluxo mensal | {brl(inv.get('monthlyCashflow', 0))} |",
        f"| Grade / score | {grade} / {score} |",
        "",
        "## Mercado local",
        "",
        f"- Média de m² no bairro: **{brl(market.get('neighborhoodAvgPricePerM2', 0))}**",
        f"- Liquidez (0–100): **{market.get('liquidityScore', 0)}**",
        f"- Demanda (heat): **{market.get('demandWeight', 0)}**",
        f"- Valorização anual modelada: **{pct(market.get('appreciationPct', 0))}**",
        f"- Idade do anúncio (proxy): **{item.get('listingAgeDays', '—')} dias**",
        "",
        "## Risco e mitigação",
        "",
    ]
    for r in risks:
        lines.append(f"- `{r}` — monitorar no underwriting e due diligence.")
    if not risks:
        lines.append("- Riscos padrão de mercado imobiliário BR (juros, liquidez, vacância).")
    lines += [
        "",
        "## Drivers de valorização",
        "",
    ]
    for d in drivers:
        lines.append(f"- {d.replace('_', ' ')}")
    lines += [
        "",
        "## Comparáveis",
        "",
    ]
    if comps:
        for c in comps:
            lines.append(f"- Asset id `{c}` (mesmo bairro/tipo no dataset)")
    else:
        lines.append("- Sem pares suficientes no bairro; ampliar raio na análise.")
    lines += [
        "",
        "## Premissas do modelo",
        "",
        f"- Entrada: **{assumptions.get('downPaymentPct', 0.2) * 100:.0f}%**",
        f"- Juros a.a.: **{assumptions.get('interestRatePct', 7)}%**",
        f"- Vacância: **{assumptions.get('vacancyPct', 0.08) * 100:.0f}%**",
        f"- Despesas / renda: **{assumptions.get('annualExpensesPct', 0.35) * 100:.0f}%**",
        f"- Horizonte: **{assumptions.get('holdingYears', 5)} anos**",
        "",
        f"**Tags:** {', '.join(tags) if tags else '—'}",
        "",
        "---",
        "",
        "_Dataset sintético calibrado · LandMap Free · não substitui laudo, escritura ou due diligence._",
        "",
    ]
    return lines


def main() -> int:
    with open(SEEDS_FILE, "r", encoding="utf-8") as f:
        properties = json.load(f)

    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    count = 0
    for item in properties:
        slug_id = slugify(
            f"{item['state']}-{item['city']}-{item['type']}-{item['modality']}-{item['title']}"
        )
        item = {**item, "slugId": slug_id}
        content = "\n".join(frontmatter(item) + body(item))
        out = OUTPUT_DIR / f"{slug_id}.md"
        # avoid rare collisions
        if out.exists():
            out = OUTPUT_DIR / f"{slug_id}-{item['id']}.md"
        out.write_text(content, encoding="utf-8")
        count += 1

    print(f"[OK] Generated {count} markdown files in {OUTPUT_DIR}")
    return 0 if count == len(properties) else 1


if __name__ == "__main__":
    raise SystemExit(main())
