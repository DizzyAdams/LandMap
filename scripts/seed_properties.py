#!/usr/bin/env python3
"""Generate 3000 investor-grade mock property records (LandMap Free dataset)."""

from __future__ import annotations

import json
import os
import random
from collections import defaultdict
from typing import Any

OUTPUT_DIR = os.path.join("data", "seeds")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "properties.json")

COUNT = 3000
TARGET_TERRENO_RATIO = 0.55
RANDOM_SEED = 42

# Weighted types: terreno dominates product positioning
TYPE_WEIGHTS = [
    ("terreno", 0.55),
    ("apartamento", 0.18),
    ("casa", 0.15),
    ("comercial", 0.12),
]
MODALITIES = ["venda", "venda", "venda", "aluguel", "lancamento"]

CITIES: list[dict[str, str]] = [
    {"city": "Curitiba", "state": "PR"},
    {"city": "Florianópolis", "state": "SC"},
    {"city": "Balneário Camboriú", "state": "SC"},
    {"city": "São Paulo", "state": "SP"},
    {"city": "Rio de Janeiro", "state": "RJ"},
    {"city": "Belo Horizonte", "state": "MG"},
    {"city": "Porto Alegre", "state": "RS"},
    {"city": "Joinville", "state": "SC"},
    {"city": "Londrina", "state": "PR"},
    {"city": "Maringá", "state": "PR"},
    {"city": "Campinas", "state": "SP"},
    {"city": "Ribeirão Preto", "state": "SP"},
    {"city": "Niterói", "state": "RJ"},
    {"city": "Uberlândia", "state": "MG"},
    {"city": "Brasília", "state": "DF"},
    {"city": "Goiânia", "state": "GO"},
    {"city": "Salvador", "state": "BA"},
    {"city": "Fortaleza", "state": "CE"},
    {"city": "Recife", "state": "PE"},
    {"city": "Itajaí", "state": "SC"},
]

NEIGHBORHOODS: dict[str, list[str]] = {
    "Curitiba": ["Batel", "Centro", "Centro Cívico", "Água Verde", "Bigorrilho", "Mercês", "Juvevê", "Bom Retiro"],
    "Florianópolis": ["Centro", "Trindade", "Jurerê", "Lagoa da Conceição", "Canasvieiras", "Ingleses"],
    "Balneário Camboriú": ["Centro", "Nações", "Pioneiros", "Barra Sul", "Municípios"],
    "São Paulo": ["Jardins", "Vila Olímpia", "Pinheiros", "Moema", "Barra Funda", "Perdizes", "Itaim Bibi"],
    "Rio de Janeiro": ["Copacabana", "Ipanema", "Barra da Tijuca", "Botafogo", "Leblon", "Flamengo"],
    "Belo Horizonte": ["Savassi", "Lourdes", "Funcionários", "Cidade Jardim", "Sion"],
    "Porto Alegre": ["Moinhos de Vento", "Bela Vista", "Centro Histórico", "Petrópolis"],
    "Joinville": ["Centro", "América", "Bucarein", "Atiradores"],
    "Londrina": ["Centro", "Gleba Palhano", "Jardim Higienópolis", "Vila Nova"],
    "Maringá": ["Zona 01", "Zona 02", "Zona 07", "Zona 03"],
    "Campinas": ["Cambuí", "Centro", "Barão Geraldo", "Nova Campinas", "Taquaral"],
    "Ribeirão Preto": ["Centro", "Jardim Irajá", "Nova Aliança", "Ribeirânia"],
    "Niterói": ["Icaraí", "Centro", "São Francisco", "Charitas", "Ingá"],
    "Uberlândia": ["Centro", "Santa Mônica", "Tibery", "Jaraguá"],
    "Brasília": ["Asa Sul", "Asa Norte", "Lago Sul", "Sudoeste", "Águas Claras"],
    "Goiânia": ["Setor Bueno", "Setor Marista", "Centro", "Jardim Goiás"],
    "Salvador": ["Barra", "Pituba", "Ondina", "Caminho das Árvores", "Itaigara"],
    "Fortaleza": ["Meireles", "Aldeota", "Cocó", "Centro", "Praia de Iracema"],
    "Recife": ["Boa Viagem", "Recife Antigo", "Casa Forte", "Pina", "Espinheiro"],
    "Itajaí": ["Centro", "Fazenda", "São João", "Cordeiros"],
}

COORDS: dict[str, tuple[float, float]] = {
    "Curitiba": (-25.4290, -49.2671),
    "Florianópolis": (-27.5954, -48.5480),
    "Balneário Camboriú": (-26.9907, -48.6301),
    "São Paulo": (-23.5505, -46.6333),
    "Rio de Janeiro": (-22.9068, -43.1729),
    "Belo Horizonte": (-19.9167, -43.9345),
    "Porto Alegre": (-30.0346, -51.2177),
    "Joinville": (-26.3045, -48.8487),
    "Londrina": (-23.3103, -51.1628),
    "Maringá": (-23.4205, -51.9333),
    "Campinas": (-22.9099, -47.0626),
    "Ribeirão Preto": (-21.1775, -47.8103),
    "Niterói": (-22.8832, -43.1034),
    "Uberlândia": (-18.9186, -48.2772),
    "Brasília": (-15.7801, -47.9292),
    "Goiânia": (-16.6869, -49.2648),
    "Salvador": (-12.9777, -38.5016),
    "Fortaleza": (-3.7172, -38.5433),
    "Recife": (-8.0476, -34.8770),
    "Itajaí": (-26.9078, -48.6619),
}

# City tier multiplies base R$/m² (premium metros & coast higher)
CITY_TIER: dict[str, float] = {
    "São Paulo": 1.35,
    "Rio de Janeiro": 1.25,
    "Brasília": 1.15,
    "Balneário Camboriú": 1.3,
    "Florianópolis": 1.2,
    "Niterói": 1.15,
    "Curitiba": 1.0,
    "Belo Horizonte": 0.95,
    "Porto Alegre": 0.95,
    "Campinas": 1.05,
    "Salvador": 0.9,
    "Fortaleza": 0.85,
    "Recife": 0.88,
    "Goiânia": 0.82,
    "Uberlândia": 0.8,
    "Ribeirão Preto": 0.85,
    "Joinville": 0.9,
    "Londrina": 0.78,
    "Maringá": 0.8,
    "Itajaí": 1.1,
}

AREAS: dict[str, tuple[int, int]] = {
    "apartamento": (35, 200),
    "casa": (80, 500),
    "terreno": (200, 2500),
    "comercial": (20, 500),
}

BEDROOMS: dict[str, tuple[int, int]] = {
    "apartamento": (1, 4),
    "casa": (2, 5),
    "terreno": (0, 0),
    "comercial": (0, 0),
}

TAGS_POOL: dict[str, list[str]] = {
    "apartamento": ["centro", "financiamento", "sacada", "vaga_garagem", "condomínio", "mobiliado", "vista_mar", "elevador"],
    "casa": ["garagem", "piscina", "quintal", "churrasqueira", "jardim", "segurança", "condomínio", "área_lazer"],
    "terreno": ["esquina", "topografia", "plano", "murado", "escritura", "loteamento", "frente_asfalto", "infra_completa"],
    "comercial": ["centro", "comercial", "ponto_referência", "vitrine", "estacionamento", "fachada"],
}

STATUS = ["active", "active", "active", "active", "sold", "rented", "reserved"]
COORD_JITTER = 0.028

# Annual rent yield by type (gross) — calibrated so grades A–F spread
RENT_YIELD: dict[str, float] = {
    "apartamento": 0.065,
    "casa": 0.06,
    "terreno": 0.055,  # proxy (dev / lease / carry)
    "comercial": 0.085,
}

RISK_POOL = [
    "liquidez_regional",
    "vacância",
    "custo_carregamento",
    "zoneamento",
    "topografia",
    "concentração_oferta",
    "juros_financiamento",
]
DRIVER_POOL = [
    "infraestrutura",
    "bairro_premium",
    "eixo_logistico",
    "turismo",
    "demanda_residencial",
    "expansao_urbana",
    "polo_empresarial",
    "litoral",
]


def pick_type() -> str:
    r = random.random()
    acc = 0.0
    for name, w in TYPE_WEIGHTS:
        acc += w
        if r <= acc:
            return name
    return "terreno"


def random_date(start_year: int = 2023, end_year: int = 2025) -> str:
    year = random.randint(start_year, end_year)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    hour = random.randint(0, 23)
    minute = random.randint(0, 59)
    return f"{year:04d}-{month:02d}-{day:02d}T{hour:02d}:{minute:02d}:00Z"


def generate_price_history(current_price: int, modality: str) -> list[dict[str, Any]]:
    if modality == "aluguel":
        return []
    entries = random.randint(4, 7)
    history: list[dict[str, Any]] = []
    price = current_price
    for i in range(entries):
        date = random_date(2022, 2025)
        if i > 0:
            price = int(price * (1 - random.uniform(0.01, 0.12)))
        else:
            price = current_price
        history.append(
            {
                "date": date,
                "price": price,
                "source": random.choice(["proprietário", "avaliação", "mercado", "registro"]),
            }
        )
    history.sort(key=lambda x: x["date"])
    return history


def base_ppm2(ptype: str) -> tuple[int, int]:
    return {
        "apartamento": (5000, 12000),
        "casa": (4000, 10000),
        "terreno": (800, 5500),
        "comercial": (3000, 9000),
    }[ptype]


def generate_property(idx: int) -> dict[str, Any]:
    loc = random.choice(CITIES)
    ptype = pick_type()
    modality = random.choice(MODALITIES)
    if ptype == "terreno" and modality == "aluguel" and random.random() < 0.7:
        modality = "venda"

    city_name = loc["city"]
    state_name = loc["state"]
    tier = CITY_TIER.get(city_name, 1.0)

    area_min, area_max = AREAS[ptype]
    area_m2 = random.randint(area_min, area_max)
    beds_min, beds_max = BEDROOMS[ptype]

    lo, hi = base_ppm2(ptype)
    price_per_m2 = int(random.randint(lo, hi) * tier)
    price = max(50_000, price_per_m2 * area_m2)
    if modality == "aluguel":
        price = max(800, price // 200)

    title_prefixes = {
        "apartamento": ["Apartamento", "Apto"],
        "casa": ["Casa", "Residência"],
        "terreno": ["Terreno", "Lote"],
        "comercial": ["Sala", "Ponto Comercial"],
    }[ptype]
    title = f"{random.choice(title_prefixes)} {city_name} #{idx}"

    base_lat, base_lng = COORDS.get(city_name, (-23.0, -47.0))
    lat = round(base_lat + random.uniform(-COORD_JITTER, COORD_JITTER), 6)
    lng = round(base_lng + random.uniform(-COORD_JITTER, COORD_JITTER), 6)

    neighborhood = random.choice(NEIGHBORHOODS.get(city_name, ["Centro"]))
    tags_pool = TAGS_POOL.get(ptype, ["imóvel"])
    tags = random.sample(tags_pool, min(random.randint(2, 4), len(tags_pool)))

    status = random.choice(STATUS)
    created_at = random_date(2023, 2025)

    # Wider yield band so score/grade diversifies (investor radar, not all F)
    annual_yield = RENT_YIELD[ptype] * random.uniform(0.7, 1.55)
    sale_price = price if modality != "aluguel" else price * 200
    monthly_rent = max(500, int(sale_price * annual_yield / 12))
    appreciation = round(random.uniform(0.035, 0.11), 4)

    risks = random.sample(RISK_POOL, k=random.randint(1, 3))
    drivers = random.sample(DRIVER_POOL, k=random.randint(2, 4))

    record: dict[str, Any] = {
        "id": str(idx),
        "schemaVersion": 2,
        "kind": "asset",
        "title": title,
        "type": ptype,
        "modality": modality,
        "city": city_name,
        "state": state_name,
        "areaM2": area_m2,
        "price": price,
        "pricePerM2": round(price / area_m2, 2) if area_m2 else 0,
        "priceFormatted": f"R$ {price:,.2f}",
        "bedrooms": random.randint(beds_min, beds_max) if beds_max > 0 else 0,
        "available": status == "active",
        "status": status,
        "latitude": lat,
        "longitude": lng,
        "neighborhood": neighborhood,
        "zone": neighborhood,
        "tags": tags,
        "images": [
            f"https://images.unsplash.com/photo-{random.randint(1_000_000, 9_999_999)}?w=800&q=80"
            for _ in range(random.randint(3, 6))
        ],
        "createdAt": created_at,
        "updatedAt": created_at,
        "priceHistory": generate_price_history(price, modality),
        "monthlyRentEstimate": monthly_rent,
        "annualAppreciationPct": appreciation,
        "risks": risks,
        "drivers": drivers,
        "listingAgeDays": random.randint(5, 240),
    }
    return record


# ─── Invest metrics (mirror of @landmap/invest analyze — deterministic) ─────


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def analyze_invest(
    price: float,
    monthly_rent: float,
    *,
    down_payment_pct: float = 0.2,
    interest_rate_pct: float = 7.0,
    loan_term_years: int = 30,
    annual_expenses_pct: float = 0.35,
    vacancy_pct: float = 0.08,
    annual_appreciation_pct: float = 0.05,
    holding_years: int = 5,
    tax_rate_pct: float = 15.0,
) -> dict[str, Any]:
    if price <= 0:
        price = 1.0
    dp = price * down_payment_pct
    loan = price * (1 - down_payment_pct)
    r = (interest_rate_pct / 100) / 12
    n = loan_term_years * 12
    if n <= 0:
        pmt = 0.0
    elif r == 0:
        pmt = loan / n
    else:
        compound = (1 + r) ** n
        pmt = (loan * r * compound) / (compound - 1)

    gross = monthly_rent * 12
    egi = gross * (1 - vacancy_pct)
    opex = gross * annual_expenses_pct
    noi = egi - opex
    cap = noi / price
    mcf = noi / 12 - pmt
    acf = mcf * 12
    coc = acf / dp if dp else 0.0
    p2r = price / gross if gross else 0.0

    months_paid = holding_years * 12
    if n <= 0 or months_paid >= n:
        bal = 0.0
    elif r == 0:
        bal = loan * (1 - months_paid / n)
    else:
        cn = (1 + r) ** n
        cm = (1 + r) ** months_paid
        bal = (loan * (cn - cm)) / (cn - 1)

    future = price * ((1 + annual_appreciation_pct) ** holding_years)
    equity = future - bal
    capital_gain = (future - price) * (1 - tax_rate_pct / 100)
    total_ret = ((acf * holding_years + capital_gain) / dp * 100) if dp else 0.0

    # IRR binary search
    flows = [-dp]
    for t in range(1, holding_years + 1):
        flows.append(acf + (equity if t == holding_years else 0.0))

    def npv(rate: float) -> float:
        return sum(f / ((1 + rate) ** t) for t, f in enumerate(flows))

    lo, hi = -0.99, 1.0
    irr = 0.0
    if npv(lo) * npv(hi) <= 0:
        for _ in range(200):
            mid = (lo + hi) / 2
            v = npv(mid)
            if abs(v) < 1e-6:
                irr = mid
                break
            if npv(lo) * v < 0:
                hi = mid
            else:
                lo = mid
        else:
            irr = (lo + hi) / 2

    # Score mirrors packages/invest BENCH/WEIGHTS
    cap_s = _clamp(cap / 0.07, 0, 1)
    coc_s = _clamp((coc + 0.1) / 0.22, 0, 1)
    p2r_s = _clamp((22 - p2r) / (22 - 8), 0, 1)
    appr_s = _clamp(annual_appreciation_pct / 0.07, 0, 1)
    sc = 100 * (0.35 * cap_s + 0.30 * coc_s + 0.20 * p2r_s + 0.15 * appr_s)
    sc = _clamp(sc, 0, 100)
    if sc >= 80:
        grade = "A"
    elif sc >= 65:
        grade = "B"
    elif sc >= 50:
        grade = "C"
    elif sc >= 35:
        grade = "D"
    else:
        grade = "F"

    return {
        "downPayment": round(dp, 2),
        "loanAmount": round(loan, 2),
        "monthlyMortgage": round(pmt, 2),
        "grossAnnualRent": round(gross, 2),
        "effectiveGrossIncome": round(egi, 2),
        "operatingExpenses": round(opex, 2),
        "netOperatingIncome": round(noi, 2),
        "capRate": round(cap, 6),
        "cashOnCash": round(coc, 6),
        "priceToRent": round(p2r, 4),
        "grossRentMultiplier": round(p2r, 4),
        "monthlyCashflow": round(mcf, 2),
        "annualCashflow": round(acf, 2),
        "remainingLoanBalance": round(bal, 2),
        "totalEquityEnd": round(equity, 2),
        "totalReturnPct": round(total_ret, 2),
        "irrPct": round(irr, 6),
        "score": round(sc, 1),
        "grade": grade,
        "monthlyRentEstimate": monthly_rent,
    }


def enrich_all(properties: list[dict[str, Any]]) -> list[dict[str, Any]]:
    # neighborhood aggregates for market block
    nhood_prices: dict[tuple[str, str], list[float]] = defaultdict(list)
    nhood_counts: dict[tuple[str, str], int] = defaultdict(int)
    for p in properties:
        key = (p["city"], p["neighborhood"])
        nhood_counts[key] += 1
        if p.get("pricePerM2"):
            nhood_prices[key].append(float(p["pricePerM2"]))

    by_nhood_type: dict[tuple[str, str, str], list[str]] = defaultdict(list)
    for p in properties:
        by_nhood_type[(p["city"], p["neighborhood"], p["type"])].append(p["id"])

    for p in properties:
        price = float(p["price"])
        # For aluguel listings, treat listed price as monthly rent
        if p["modality"] == "aluguel":
            monthly = price
            sale_proxy = monthly * 180
        else:
            monthly = float(p.get("monthlyRentEstimate") or max(500, price * 0.06 / 12))
            sale_proxy = price

        appr = float(p.get("annualAppreciationPct") or 0.05)
        # Mix underwriting styles: cash-heavy deals score better (real FO/PE patterns)
        cash_deal = random.random() < 0.35
        assumptions = {
            "downPaymentPct": 1.0 if cash_deal else random.choice([0.2, 0.3, 0.4, 0.5]),
            "interestRatePct": 0.0 if cash_deal else random.choice([6.0, 7.0, 8.5, 10.0]),
            "loanTermYears": 30,
            "annualExpensesPct": 0.22 if p["type"] == "terreno" else random.choice([0.25, 0.3, 0.35]),
            "vacancyPct": 0.1 if p["type"] == "terreno" else random.choice([0.05, 0.08, 0.1]),
            "annualAppreciationPct": appr,
            "holdingYears": random.choice([5, 7, 10]),
            "taxRatePct": 15.0,
        }
        invest = analyze_invest(
            sale_proxy,
            monthly,
            down_payment_pct=assumptions["downPaymentPct"],
            interest_rate_pct=assumptions["interestRatePct"],
            loan_term_years=int(assumptions["loanTermYears"]),
            annual_expenses_pct=assumptions["annualExpensesPct"],
            vacancy_pct=assumptions["vacancyPct"],
            annual_appreciation_pct=assumptions["annualAppreciationPct"],
            holding_years=int(assumptions["holdingYears"]),
            tax_rate_pct=assumptions["taxRatePct"],
        )
        p["assumptions"] = assumptions
        p["invest"] = invest
        p["grade"] = invest["grade"]
        p["score"] = invest["score"]
        p["capRate"] = invest["capRate"]

        key = (p["city"], p["neighborhood"])
        prices = nhood_prices.get(key) or [p.get("pricePerM2") or 0]
        avg_ppm2 = sum(prices) / len(prices)
        count = nhood_counts.get(key, 1)
        demand = _clamp(count / 40, 0, 1)
        liquidity = _clamp(count / 50 * 100, 0, 100)
        p["market"] = {
            "neighborhoodAvgPricePerM2": round(avg_ppm2, 2),
            "neighborhoodCount": count,
            "liquidityScore": round(liquidity, 1),
            "demandWeight": round(demand, 3),
            "appreciationPct": appr,
        }

        peers = [i for i in by_nhood_type[(p["city"], p["neighborhood"], p["type"])] if i != p["id"]]
        random.shuffle(peers)
        p["comps"] = peers[:3]

        # Thesis bullets
        grade = invest["grade"]
        cap_pct = invest["capRate"] * 100
        thesis = [
            f"Grade {grade} com score {invest['score']:.0f}/100 no modelo LandMap.",
            f"Cap rate estimado {cap_pct:.2f}% sob premissas transparentes de vacância e opex.",
            f"Drivers: {', '.join(p.get('drivers') or ['mercado local'])}.",
        ]
        if p["type"] == "terreno":
            thesis.append(
                "Ativo terreno: yield proxy de carrego/desenvolvimento — validar zoneamento e outorga."
            )
        p["thesis"] = thesis

    return properties


def write_outputs(properties: list[dict[str, Any]]) -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(properties, f, ensure_ascii=False, indent=2)

    api_data_dir = os.path.join("packages", "api", "src", "data")
    os.makedirs(api_data_dir, exist_ok=True)
    api_data_file = os.path.join(api_data_dir, "properties.json")
    with open(api_data_file, "w", encoding="utf-8") as f:
        json.dump(properties, f, ensure_ascii=False, indent=2)


def main() -> int:
    random.seed(RANDOM_SEED)
    properties = [generate_property(i) for i in range(1, COUNT + 1)]
    # Separate RNG stream for underwriting so type/city layout stays stable
    random.seed(RANDOM_SEED + 7)
    properties = enrich_all(properties)
    write_outputs(properties)

    terrenos = sum(1 for p in properties if p["type"] == "terreno")
    grades: dict[str, int] = defaultdict(int)
    for p in properties:
        grades[str(p.get("grade", "?"))] += 1

    print(f"[OK] Generated {len(properties)} properties -> {OUTPUT_FILE}")
    print(f"   terrenos: {terrenos}/{len(properties)} ({100 * terrenos / len(properties):.1f}%)")
    print(f"   cities: {len({p['city'] for p in properties})}")
    print(f"   grades: {dict(sorted(grades.items()))}")
    if terrenos / len(properties) < TARGET_TERRENO_RATIO - 0.02:
        print(f"[WARN] terreno ratio below target {TARGET_TERRENO_RATIO}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
