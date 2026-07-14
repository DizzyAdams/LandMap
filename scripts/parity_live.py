#!/usr/bin/env python3
"""Live parity validator — LandMap vs Lovable design system.

Read-only. Hits the LIVE production deploy, checks every route × locale for:
  1. HTTP 200
  2. <title> present
  3. og:image meta present
  4. Lovable token present in served CSS (--background:oklch(100% ...)
  5. NO brand-hex drift in served CSS (except /world which is exempt)

Exits 0 always; prints a structured report + a 0-100% score.
"""
import ssl, sys, re, json, urllib.request
from urllib.parse import urljoin

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE = "https://landmapprod.vercel.app"
LOCALES = ["pt-BR", "en-US", "es-ES"]
PATHS = [
    "", "search", "map", "compare", "favorites", "alerts", "chat", "calculator",
    "world", "pricing", "docs", "docs/embedding", "insights", "live", "offline",
    "status", "studio", "sales", "regions", "onboarding", "terrenos", "v2",
    "admin", "admin/analytics", "admin/audit", "admin/exports", "admin/leads",
    "admin/properties", "admin/settings", "admin/webhooks", "property/{id}",
]
EXEMPT_WORLD = {"world"}  # World 3D feature palette is allowed to use brand hexes
BRAND_HEX = ["34d399", "22d3ee", "a78bfa", "d4af37", "6ee7b7", "f4e2a1", "e8c873", "a67c00"]
BRAND_RE = re.compile("(?:#|%23)(" + "|".join(BRAND_HEX) + ")", re.I)


def fetch(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
        return r.status, r.read().decode("utf-8", "ignore")


def get_property_id():
    try:
        _, body = fetch(BASE + "/api/properties?limit=1")
        m = re.search(r'"id"\s*:\s*"([^"]+)"', body)
        return m.group(1) if m else None
    except Exception:
        return None


def css_links(html, base):
    return re.findall(r'<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\']([^"\']+)["\']', html)


def main():
    pid = get_property_id()
    if not pid:
        print("WARN: could not resolve a property id; skipping /property/[id] route")
    results = []
    total = 0
    passed = 0
    for loc in LOCALES:
        for p in PATHS:
            if p == "property/{id}":
                if not pid:
                    continue
                path = f"property/{pid}"
            else:
                path = p
            url = f"{BASE}/{loc}/{path}" if path else f"{BASE}/{loc}"
            checks = {}
            try:
                status, html = fetch(url)
                checks["http200"] = status == 200
                checks["title"] = "<title>" in html.lower()
                checks["ogimage"] = 'property="og:image"' in html.lower() or 'property="og:image"' in html
                # fetch CSS
                drift = False
                lovable = False
                try:
                    for lnk in css_links(html, url)[:3]:
                        _, css = fetch(urljoin(url, lnk))
                        if BRAND_RE.search(css):
                            if path.split("/")[0] not in EXEMPT_WORLD:
                                drift = True
                        if "oklch(100%" in css:
                            lovable = True
                except Exception:
                    pass
                checks["css_lovable"] = lovable
                checks["css_no_drift"] = not drift
            except Exception as e:
                checks = {k: False for k in ["http200", "title", "ogimage", "css_lovable", "css_no_drift"]}
                checks["_err"] = str(e)[:80]
            n = len(checks)
            ok = sum(1 for v in checks.values() if v is True)
            total += n
            passed += ok
            results.append((f"{loc}/{path}", ok, n, checks))
    print("=" * 70)
    print("LIVE PARITY REPORT —", BASE)
    print("=" * 70)
    fails = 0
    for route, ok, n, ch in results:
        flag = "" if ok == n else "  <-- GAP"
        if ok != n:
            fails += 1
            print(f"[{ok}/{n}]{flag} {route}")
            for k, v in ch.items():
                if v is not True:
                    print(f"        - {k}: {v}")
    print("-" * 70)
    print(f"Routes checked: {len(results)} | GAP routes: {fails}")
    print(f"Checks passed: {passed}/{total} = {100.0*passed/total:.1f}%")
    print("=" * 70)


if __name__ == "__main__":
    main()
