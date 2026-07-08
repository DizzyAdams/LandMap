import json
import os
from pathlib import Path

SEEDS_FILE = Path("data/seeds/properties.json")
OUTPUT_DIR = Path("data/markdowns")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

with open(SEEDS_FILE, "r", encoding="utf-8") as f:
    properties = json.load(f)


def slugify(value: str) -> str:
    return value.strip().lower().replace(" ", "-")


count = 0
for item in properties:
    city = item["city"]
    state = item["state"]
    ptype = item["type"]
    modality = item["modality"]
    title = item["title"]
    price = item["price"]
    area = item["areaM2"]
    beds = item.get("bedrooms")
    neighborhood = item.get("neighborhood", city)
    modality_label = {
        "venda": "venda",
        "aluguel": "aluguel",
        "lancamento": "lan\u00e7amento",
    }.get(modality, modality)

    lines = [
        "---",
        f'id: "{slugify(f"{state}-{city}-{ptype}-{modality}-{title}")}"',
        f'title: "{title}"',
        f'city: "{city}"',
        f'state: "{state}"',
        f'type: "{ptype}"',
        f'modality: "{modality}"',
        f'price: {price}',
        f'areaM2: {area}',
    ]
    if beds:
        lines.append(f"bedrooms: {beds}")
    lines += [
        "---",
        "",
        f"# {title}",
        "",
        f"Im\u00f3vel em {city}/{state}, {ptype} na modalidade {modality_label}.",
        f"\u00c1rea: {area}m\u00b2 | Valor: R$ {price:,}.",
        f"Bairro: {neighborhood}.",
        "",
        "Tags: " + ", ".join(item.get("tags", [])) + ".",
    ]

    slug_name = slugify(f"{state}-{city}-{ptype}-{modality}-{title}")
    out = OUTPUT_DIR / f"{slug_name}.md"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    count += 1

print(f"[OK] Generated {count} markdown files in {OUTPUT_DIR}")
