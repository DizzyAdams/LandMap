#!/usr/bin/env python3
"""Print Lovable's full route tree from its routes chunk."""
import os, re, urllib.request
from urllib.parse import urljoin

BASE = "https://landmap-insight.lovable.app"
H = {"User-Agent": "Mozilla/5.0"}
TIMEOUT = 25

def fetch(url, binary=False):
    req = urllib.request.Request(url, headers=H)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        d = r.read()
        return d if binary else d.decode("utf-8", "replace")

home = fetch(BASE + "/")
m = re.search(r"routes-[A-Za-z0-9_\-]+\.js", home)
print("routes chunk:", m.group(0) if m else "NONE")
url = urljoin(BASE, "/assets/" + m.group(0))
js = fetch(url)

paths = set()
for mm in re.finditer(r'i:\\?"((?:[^"\\]|\\.)*?)\\?"', js):
    raw = mm.group(1).encode().decode("unicode_escape")
    p = raw.replace("\x00", "/").strip("/")
    if p:
        paths.add(p)
# also catch direct path strings like "/regions"
for mm in re.finditer(r'["\'](/[a-z][a-z0-9/\-_]*)["\']', js):
    paths.add(mm.group(1).lstrip("/"))

for p in sorted(paths):
    print("ROUTE:", "/" + p if p else "/")
