#!/usr/bin/env python3
"""Generate mock leads and write to a JSON file."""

from __future__ import annotations

import json
import os
import random
from typing import Any

OUTPUT_DIR = os.path.join("data", "seeds")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "leads.json")

SOURCES = [
    "landmap_search",
    "cold_outreach",
    "indication",
    "social_media",
    "email_campaign",
    "website_form",
]

STAGES = [
    "new",
    "contacted",
    "qualified",
    "proposal",
    "negotiation",
    "closed_won",
    "closed_lost",
]

FIRST_NAMES = [
    "Alice",
    "Bob",
    "Carol",
    "Daniel",
    "Eduarda",
    "Felipe",
    "Gabriela",
    "Henrique",
    "Isabela",
    "João",
    "Karina",
    "Lucas",
    "Mariana",
    "Nicolas",
    "Olívia",
    "Pedro",
    "Quintino",
    "Rafaela",
    "Sofia",
    "Thiago",
]

LAST_NAMES = [
    "Silva",
    "Costa",
    "Mendes",
    "Oliveira",
    "Pereira",
    "Almeida",
    "Santos",
    "Lima",
    "Barbosa",
    "Ribeiro",
    "Carvalho",
    "Gomes",
    "Martins",
    "Araújo",
    "Nunes",
]

CITIES: list[dict[str, str]] = [
    {"city": "Curitiba", "state": "PR"},
    {"city": "Florianópolis", "state": "SC"},
    {"city": "Balneário Camboriú", "state": "SC"},
    {"city": "São Paulo", "state": "SP"},
    {"city": "Rio de Janeiro", "state": "RJ"},
    {"city": "Belo Horizonte", "state": "MG"},
]


def generate_lead(idx: int) -> dict[str, Any]:
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    name = f"{first} {last}"
    email = f"{first.lower()}.{last.lower()}@example.com"
    phone = f"+55 11 9{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"

    loc = random.choice(CITIES)
    score = random.randint(10, 100)

    return {
        "id": f"lead-{idx:04d}",
        "name": name,
        "email": email,
        "phone": phone,
        "city": loc["city"],
        "state": loc["state"],
        "score": score,
        "source": random.choice(SOURCES),
        "stage": random.choice(STAGES),
        "notes": f"Lead gerado via seed — score {score}, fonte {random.choice(SOURCES)}.",
        "createdAt": "2025-02-01T00:00:00Z",
    }


def main() -> int:
    count = 50
    random.seed(123)

    leads = [generate_lead(i) for i in range(1, count + 1)]

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(leads, f, ensure_ascii=False, indent=2)

    print(f"✅ Generated {len(leads)} mock leads → {OUTPUT_FILE}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
