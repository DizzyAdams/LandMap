#!/usr/bin/env python3
"""Generate mock property records and write to a JSON file."""

from __future__ import annotations

import json
import os
import random
from typing import Any

OUTPUT_DIR = os.path.join("data", "seeds")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "properties.json")

TYPES = ["apartamento", "casa", "terreno", "comercial"]
MODALITIES = ["venda", "aluguel", "lancamento"]

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
}

AREAS: dict[str, tuple[int, int]] = {
    "apartamento": (35, 200),
    "casa": (80, 500),
    "terreno": (200, 1000),
    "comercial": (20, 500),
    "cobertura": (100, 350),
}

BEDROOMS: dict[str, tuple[int, int]] = {
    "apartamento": (1, 4),
    "casa": (2, 5),
    "terreno": (0, 0),
    "comercial": (0, 0),
    "cobertura": (2, 5),
}

TAGS_POOL: dict[str, list[str]] = {
    "apartamento": ["centro", "financiamento", "sacada", "vaga_garagem", "condomínio", "mobiliado", "vista_mar", "elevador"],
    "casa": ["garagem", "piscina", "quintal", "churrasqueira", "jardim", "segurança", "condomínio", "área_lazer"],
    "terreno": ["esquina", "topografia", "plano", "murado", "escritura", "loteamento"],
    "comercial": ["centro", "comercial", "ponto_referência", "vitrine", "estacionamento", "fachada"],
    "cobertura": ["vista_mar", "luxo", "cobertura", "penthouse", "privativa", "rooftop", "piscina"],
}

STATUS = ["active", "active", "active", "active", "sold", "rented", "reserved"]
COORD_JITTER = 0.03


def random_date(start_year: int = 2023, end_year: int = 2025) -> str:
    """Generate a random ISO datetime string."""
    year = random.randint(start_year, end_year)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    hour = random.randint(0, 23)
    minute = random.randint(0, 59)
    return f"{year:04d}-{month:02d}-{day:02d}T{hour:02d}:{minute:02d}:00Z"


def generate_price_history(type_: str, current_price: int, modality: str) -> list[dict[str, Any]]:
    """Generate 3-5 price history entries."""
    if modality == "aluguel":
        return []  # rental properties don't have price history

    entries = random.randint(3, 5)
    history: list[dict[str, Any]] = []
    price = current_price

    for i in range(entries):
        date = random_date(2022, 2024)
        # Each older entry is 1-15% cheaper than current
        variation = random.uniform(0.01, 0.15)
        if i > 0:
            price = int(price * (1 - variation))
        else:
            price = current_price

        history.append({
            "date": date,
            "price": price,
            "source": random.choice(["proprietário", "avaliação", "mercado", "registro"]),
        })

    # Sort by date ascending
    history.sort(key=lambda x: x["date"])
    return history


def generate_property(idx: int) -> dict[str, Any]:
    loc = random.choice(CITIES)
    ptype = random.choice(TYPES)
    modality = random.choice(MODALITIES)

    city_name = loc["city"]
    state_name = loc["state"]

    area_min, area_max = AREAS[ptype]
    area_m2 = random.randint(area_min, area_max)
    beds_min, beds_max = BEDROOMS[ptype]

    base_price_per_m2 = {
        "apartamento": (5000, 12000),
        "casa": (4000, 10000),
        "terreno": (1500, 5000),
        "comercial": (3000, 9000),
        "cobertura": (8000, 18000),
    }[ptype]

    price_per_m2 = random.randint(*base_price_per_m2)
    price = price_per_m2 * area_m2

    if modality == "aluguel":
        price = price // 200  # ~0.5% do valor de venda

    title_prefixes = {
        "apartamento": ["Apartamento", "Apto"],
        "casa": ["Casa", "Residência"],
        "terreno": ["Terreno", "Lote"],
        "comercial": ["Sala", "Ponto Comercial"],
        "cobertura": ["Cobertura", "Penthouse"],
    }[ptype]

    title = f"{random.choice(title_prefixes)} {city_name} #{idx}"

    base_lat, base_lng = COORDS.get(city_name, (-23.0, -47.0))
    lat = round(base_lat + random.uniform(-COORD_JITTER, COORD_JITTER), 6)
    lng = round(base_lng + random.uniform(-COORD_JITTER, COORD_JITTER), 6)

    neighborhood = random.choice(NEIGHBORHOODS.get(city_name, ["Centro"]))
    tags_pool = TAGS_POOL.get(ptype, ["imóvel"])
    num_tags = random.randint(1, 4)
    tags = random.sample(tags_pool, min(num_tags, len(tags_pool)))

    num_images = random.randint(3, 8)
    images = [f"https://images.unsplash.com/photo-{random.randint(1000000, 9999999)}?w=800&q=80" for _ in range(num_images)]

    status = random.choice(STATUS)

    created_at = random_date(2023, 2025)
    updated_at = created_at

    record: dict[str, Any] = {
        "id": str(idx),
        "title": title,
        "type": ptype,
        "modality": modality,
        "city": city_name,
        "state": state_name,
        "areaM2": area_m2,
        "price": price,
        "priceFormatted": f"R$ {price:,.2f}",
        "bedrooms": random.randint(beds_min, beds_max) if beds_max > 0 else 0,
        "available": status == "active",
        "status": status,
        "latitude": lat,
        "longitude": lng,
        "neighborhood": neighborhood,
        "zone": neighborhood,
        "tags": tags,
        "images": images,
        "createdAt": created_at,
        "updatedAt": updated_at,
        "priceHistory": generate_price_history(ptype, price, modality),
    }

    return record


def main() -> int:
    count = 1500
    random.seed(42)

    properties = [generate_property(i) for i in range(1, count + 1)]

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(properties, f, ensure_ascii=False, indent=2)

    # Also drop a bundle copy inside the API package so it is compiled into the
    # serverless build (no runtime filesystem access needed on Vercel).
    api_data_dir = os.path.join("packages", "api", "src", "data")
    os.makedirs(api_data_dir, exist_ok=True)
    api_data_file = os.path.join(api_data_dir, "properties.json")
    with open(api_data_file, "w", encoding="utf-8") as f:
        json.dump(properties, f, ensure_ascii=False, indent=2)

    print(f"[OK] Generated {len(properties)} mock properties -> {OUTPUT_FILE}")

    # Print priceHistory stats for verification
    with_ph = [p for p in properties if p.get("priceHistory")]
    print(f"   Properties with price history: {len(with_ph)}/{len(properties)}")
    avg_entries = sum(len(p["priceHistory"]) for p in with_ph) / max(len(with_ph), 1)
    print(f"   Average price history entries: {avg_entries:.1f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
