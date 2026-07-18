from pathlib import Path
t = Path(r"scripts/_lovable_pull/reference_public/lovable_chunk_dashboard.js").read_text(encoding="utf-8", errors="replace")
# dump readable ASCII windows around key strings
keys = ["Buscar bairro", "Camadas de intelig", "Escala do heatmap", "Top valoriza", "Top oportuni", "Score LandMap", "Composi", "Falha ao carregar", "layerScores", "checked:"]
for k in keys:
    i = t.find(k)
    print("\n====", k, i)
    if i < 0:
        continue
    chunk = t[max(0,i-120):i+350]
    out = []
    for ch in chunk:
        o = ord(ch)
        if 32 <= o < 127 or ch in "áàâãéêíóôõúçÁÉÍÓÚÇm²":
            out.append(ch)
        else:
            out.append(" ")
    print("".join(out))
# find all label:` pairs with id nearby in layers array K=
idx = t.find("id:`valorization`")
print("\nLAYER ARR", idx)
if idx>=0:
    print("".join(ch if 32<=ord(ch)<127 or ord(ch)>160 else " " for ch in t[idx:idx+1200]))
