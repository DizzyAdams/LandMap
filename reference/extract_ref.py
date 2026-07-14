#!/usr/bin/env python3
"""Extract real Lovable UI copy (string literals) per route from its JS chunk.

Lovable is a TanStack Router SPA: subroute HTML is a shell. The actual
component text lives in the per-route JS chunk (e.g. regions-*.js). We fetch
each route HTML, locate the route-specific chunk URL, download it (cached),
and pull out human-readable string literals. This is the authoritative
reference for "literal" content parity.
"""
import os, re, sys, urllib.request, threading
from urllib.parse import urljoin
from collections import OrderedDict

BASE = "https://landmap-insight.lovable.app"
OUT = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(OUT, "assets")
os.makedirs(ASSETS, exist_ok=True)

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
TIMEOUT = 20

# route -> keyword to find its specific chunk in the HTML preload list
ROUTES = OrderedDict([
    ("/",            "index"),
    ("/regions",     "regions"),
    ("/favorites",   "favorites"),
    ("/compare",     "compare"),
    ("/dashboard",   "dashboard"),
    ("/admin",       "admin"),
    ("/plans",       "plans"),
    ("/auth",        "auth"),
    ("/map",         "map"),
    ("/search",      "search"),
    ("/onboarding",  "onboarding"),
])

lock = threading.Lock()

def fetch(url, binary=False):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            data = r.read()
            return data if binary else data.decode("utf-8", "replace")
    except Exception as e:
        print(f"  FAIL {url}: {e}")
        return None

def cached_get(url, name):
    path = os.path.join(ASSETS, name)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    body = fetch(url, binary=True)
    if body is None:
        return None
    with open(path, "wb") as f:
        f.write(body)
    return body.decode("utf-8", "replace")

def find_route_chunk(html, keyword):
    # find all /assets/*.js references
    urls = re.findall(r'(?:src|href)\s*=\s*["\']([^"\']*?/assets/[^"\']*\.js[^"\']*)["\']', html)
    urls += re.findall(r'preloads:\$R\[\d+\]=\[([^\]]*)\]', html)
    flat = []
    for u in urls:
        flat += re.findall(r'["\'](/assets/[^"\']*\.js)["\']', u)
    # prefer a chunk whose name contains the keyword and is route-specific
    for u in flat:
        fn = u.split("/")[-1]
        if keyword in fn and keyword not in ("index",):
            return urljoin(BASE, u), fn
    # fallback: any chunk containing keyword
    for u in flat:
        if keyword in u:
            return urljoin(BASE, u), u.split("/")[-1]
    return None, None

def extract_strings(js):
    # match single/double/template string literals, keep ones with letters and len>=3
    out = []
    for m in re.finditer(r'(?<![A-Za-z0-9_])(?:"([^"\\\n]{3,120})"|\'([^\'\\\n]{3,120})\')', js):
        s = m.group(1) or m.group(2)
        if not re.search(r'[A-Za-zÀ-ÿ]', s):
            continue
        if re.search(r'\\n|\\t|https?://|^\s*$', s):
            continue
        out.append(s)
    # dedupe preserve order
    seen = set(); res = []
    for s in out:
        if s not in seen:
            seen.add(s); res.append(s)
    return res

def main():
    for route, kw in ROUTES.items():
        print(f"\n===== ROUTE {route} (kw={kw}) =====")
        html = fetch(BASE + route)
        if not html:
            print("  (no html)"); continue
        chunk_url, chunk_name = find_route_chunk(html, kw)
        if not chunk_url:
            print("  (no route chunk found)"); continue
        print(f"  chunk: {chunk_name}")
        js = cached_get(chunk_url, "chunk_" + re.sub(r'[^a-z]', '_', kw) + ".js")
        if not js:
            print("  (chunk download failed)"); continue
        strings = extract_strings(js)
        # filter to plausible UI copy: contains space or is a known UI word, len>=4
        ui = [s for s in strings if len(s) >= 4 and ((' ' in s) or re.search(r'[A-ZÁ-Ý][a-zá-ÿ]', s))]
        print(f"  strings: {len(strings)} | UI-ish: {len(ui)}")
        for s in ui[:80]:
            print("   • " + s)

if __name__ == "__main__":
    main()
