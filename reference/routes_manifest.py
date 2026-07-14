#!/usr/bin/env python3
"""Extract Lovable's full route list from the $_TSR manifest embedded in the
home HTML. Top-level keys of `routes:$R[2]={...}` are the route paths
separated by \\u0000 (rendered as NUL)."""
import os, re, urllib.request

BASE = "https://landmap-insight.lovable.app"
H = {"User-Agent": "Mozilla/5.0"}

def fetch(url):
    req = urllib.request.Request(url, headers=H)
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode("utf-8", "replace")

html = fetch(BASE + "/")
i = html.find("routes:$R[")
seg = html[i:]
end = seg.find('}}]}' )
seg = seg[:end+4] if end > 0 else seg[:4000]
# top-level keys:  "...":$R[  (the path strings)
keys = re.findall(r'"((?:[^"\\]|\\.)*)":\$R\[\d+\]=', seg)
paths = set()
for k in keys:
    k = k.encode().decode("unicode_escape")
    k = k.replace("\x00", "/").strip("/")
    if k:
        paths.add("/" + k if k != "__root__" else "(root)")
for p in sorted(paths):
    print("LOVABLE ROUTE:", p)
print("\nTOTAL:", len(paths))
