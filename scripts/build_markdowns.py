import os
from pathlib import Path

OUTPUT_DIR = Path('data/markdowns')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

items = [
    {"title":"Apartamento padrão","city":"Curitiba","state":"PR","price":420000,"areaM2":72,"type":"apartamento","modality":"venda"},
    {"title":"Casa térrea","city":"Florianópolis","state":"SC","price":890000,"areaM2":180,"type":"casa","modality":"venda"},
    {"title":"Terreno plano","city":"Curitiba","state":"PR","price":210000,"areaM2":360,"type":"terreno","modality":"venda"},
    {"title":"Sala comercial","city":"Curitiba","state":"PR","price":1800,"areaM2":35,"type":"comercial","modality":"aluguel"},
    {"title":"Cobertura duplex","city":"Florianópolis","state":"SC","price":1500000,"areaM2":140,"bedrooms":3,"type":"apartamento","modality":"venda"},
    {"title":"Apartamento lançamento","city":"Balneário Camboriú","state":"SC","price":780000,"areaM2":85,"bedrooms":2,"type":"apartamento","modality":"lancamento"},
]

slug = lambda s: s.strip().lower()

for item in items:
    city = item["city"]
    state = item["state"]
    ptype = item["type"]
    modality = item["modality"]
    price = item["price"]
    area = item["areaM2"]
    beds = item.get("bedrooms")
    title = item["title"]

    lines = [
        "---",
        f'id: "{state}-{city}-{ptype}-{modality}-{title}".replace(" ", "-").lower()',
        f'title: "{title}"',
        f'city: "{city}"',
        f'state: "{state}"',
        f'type: "{ptype}"',
        f'modality: "{modality}"',
        f'price: {price}',
        f'areaM2: {area}',
    ]
    if beds is not None:
        lines.append(f'bedrooms: {beds}')
    lines += ["---", "", f"# {title}", "", f"Imóvel em {city}/{state}, {ptype} na modalidade {modality}.", f"Área: {area}m² | Valor: R$ {price:,}."]

    slug_name = f"{state}-{city}-{ptype}-{modality}-{title}".replace(" ", "-").lower()
    out = OUTPUT_DIR / f"{slug_name}.md"
    out.write_text("\n".join(lines) + "\n", encoding='utf8')

print(f"Generated {len(items)} markdown files in {OUTPUT_DIR}")
