#!/usr/bin/env python3
"""Download ALL Lovable JS chunks (from home HTML) and extract Portuguese UI
copy. The route chunks are thin re-exports; the real text lives in dist-*.js."""
import os, re, sys, urllib.request
from urllib.parse import urljoin

BASE = "https://landmap-insight.lovable.app"
OUT = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(OUT, "assets")
os.makedirs(ASSETS, exist_ok=True)
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
TIMEOUT = 25

def fetch(url, binary=False):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            d = r.read()
            return d if binary else d.decode("utf-8", "replace")
    except Exception as e:
        print(f"  FAIL {url.split('/')[-1]}: {e}")
        return None

def cached(url):
    name = re.sub(r'[^A-Za-z0-9._-]', '_', url.split('/assets/')[-1].split('?')[0])
    path = os.path.join(ASSETS, name)
    if os.path.exists(path):
        return open(path, "r", encoding="utf-8").read()
    b = fetch(url, binary=True)
    if b is None:
        return None
    open(path, "wb").write(b)
    return b.decode("utf-8", "replace")

home = fetch(BASE + "/")
all_urls = re.findall(r'(?:src|href)\s*=\s*["\']([^"\']*?/assets/[^"\']*\.js[^"\']*)["\']', home or "")
all_urls += re.findall(r'preloads:\$R\[\d+\]=\[([^\]]*)\]', home or "")
flat = []
for u in all_urls:
    flat += re.findall(r'["\'](/assets/[^"\']*\.js)["\']', u)
flat = list(dict.fromkeys(flat))
print(f"chunk URLs found: {len(flat)}")
texts = []
for u in flat:
    js = cached(urljoin(BASE, u))
    if not js:
        continue
    # find template/render strings that contain Portuguese words
    for m in re.finditer(r'>\s*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9 ,.:!?()\-/]{4,80}?)\s*<', js):
        s = m.group(1).strip()
        if re.search(r'(ção|ções|ões|ão|ç|ções|mente|Regi|Plan|Dash|Fav|Compar|Entrar|Sair|Bus|Terreno|Valor|Pre|Map|Anál|Relat|Perfil|Config|Conta|Assin|Premium|Grat|Básico|Pro|Notific|Alert)', s):
            texts.append(s)
    # also JSX text children: {"..."} or '...' standalone in JSX-ish context
    for m in re.finditer(r'\{["\']([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9 ,.:!?()\-/]{4,80})["\']\}', js):
        s = m.group(1).strip()
        if re.search(r'(ção|ções|ões|ão|ç|Regi|Plan|Dash|Fav|Compar|Entrar|Sair|Bus|Terreno|Valor|Pre|Map|Anál|Relat|Perfil|Config|Conta|Assin|Premium|Grat|Básico|Pro|Notific|Alert)', s):
            texts.append(s)
uniq = list(dict.fromkeys(texts))
print(f"\n===== {len(uniq)} unique Portuguese UI phrases =====")
for s in sorted(uniq):
    print("  • " + s)
