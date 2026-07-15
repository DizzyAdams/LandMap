import json

def flatten(d, prefix=""):
    out = set()
    for k, v in d.items():
        key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            out |= flatten(v, key)
        else:
            out.add(key)
    return out

ROUTES = ["home", "regions", "favorites", "compare", "dashboard", "admin",
          "plans", "auth", "map", "search", "onboarding", "kpis"]

base = "apps/web/messages"
pt = json.load(open(f"{base}/pt-BR.json"))
en = json.load(open(f"{base}/en-US.json"))
es = json.load(open(f"{base}/es-ES.json"))

ptk = flatten(pt)
enk = flatten(en)
esk = flatten(es)

print("=== pt-BR total keys:", len(ptk))
print("=== en-US total keys:", len(enk))
print("=== es-ES total keys:", len(esk))

# Filter to shared routes (top-level keys in the route list)
def route_keys(keyset):
    return {k for k in keyset if k.split(".")[0] in ROUTES}

print("\n=== Missing in en-US (vs pt-BR), routes only:")
missing_en = sorted(route_keys(ptk) - route_keys(enk))
print(missing_en if missing_en else "NONE")

print("\n=== Missing in es-ES (vs pt-BR), routes only:")
missing_es = sorted(route_keys(ptk) - route_keys(esk))
print(missing_es if missing_es else "NONE")

# Also report full-file (all keys) missing for completeness
print("\n=== Missing in en-US (vs pt-BR), ALL keys:")
print(sorted(ptk - enk) if (ptk - enk) else "NONE")
print("\n=== Missing in es-ES (vs pt-BR), ALL keys:")
print(sorted(ptk - esk) if (ptk - esk) else "NONE")
