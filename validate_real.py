#!/usr/bin/env python3
"""
REAL production validation (replaces the flawed validate_routes.py).
Checks signals that are actually observable on the deployed HTML:

 1. HTTP 200 for every route (home x3 locales + all pt-BR routes)
 2. Correct <title> per route (matches Lovable / our intended titles)
 3. meta description + OG tags present on every page
 4. Fonts: DM Sans (+ Space Grotesk / JetBrains Mono) loaded via <link>
 5. Linked CSS bundle present (globals.css)
 6. No Next.js error boundary text ("Application error", "missing required error")
 7. i18n: /en-US and /es-ES home also 200 with a <title>

This does NOT grep oklch from HTML (CSS is linked, not inlined) — that
old check was a false negative. Design tokens are validated via the build,
not via raw HTML scraping.

Run:  python validate_real.py
BASE = env VAL_BASE_URL (default https://landmapprod.vercel.app)
"""
import os, re, sys, concurrent.futures, urllib.request
from urllib.parse import urljoin

BASE = os.environ.get("VAL_BASE_URL", "https://landmapprod.vercel.app")
if not BASE.startswith("http"):
    BASE = "http://" + BASE

HOME = ["/pt-BR", "/en-US", "/es-ES"]
PT = ["/pt-BR/regions", "/pt-BR/favorites", "/pt-BR/compare", "/pt-BR/dashboard",
      "/pt-BR/admin", "/pt-BR/plans", "/pt-BR/auth", "/pt-BR/map", "/pt-BR/onboarding",
      "/pt-BR/insights", "/pt-BR/sales",
      "/pt-BR/chat", "/pt-BR/search", "/pt-BR/calculator", "/pt-BR/studio",
      "/pt-BR/live", "/pt-BR/status"]
ALL = HOME + PT
STATICS = ["/favicon.ico", "/favicon.svg", "/og-image.svg", "/manifest.json",
           "/icons/icon-192.svg", "/icons/icon-512.svg"]

EXPECT_TITLE = {
    "/pt-BR": "LandMap — Inteligência de terrenos",
    "/en-US": "LandMap — Land intelligence",
    "/es-ES": "LandMap — Inteligencia de terrenos",
    "/pt-BR/regions": "Regiões — LandMap",
    "/pt-BR/favorites": "Favoritos — LandMap",
    "/pt-BR/compare": "Comparação de regiões — LandMap",
    "/pt-BR/admin": "Administração — LandMap",
    "/pt-BR/plans": "Planos — LandMap",
    "/pt-BR/auth": "Entrar — LandMap",
    "/pt-BR/dashboard": "Mapa — LandMap",
}

ERROR_TEXTS = ["application error", "missing required error component",
               "this page could not be found", "Internal Server Error"]

# Canonical fonts per design standard: DM Sans + Space Grotesk only
# (JetBrains Mono was drift — removed; Lovable live loads exactly these 2).
FONTS = ["DM+Sans", "Space+Grotesk"]


def fetch(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; Validator/1.0)"})
        with urllib.request.urlopen(req, timeout=25) as r:
            return {"status": r.status, "content": r.read().decode("utf-8", "replace"), "err": ""}
    except Exception as e:
        return {"status": 0, "content": "", "err": str(e)[:80]}


def title_of(html):
    m = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
    return m.group(1).strip() if m else ""


def has_meta_desc(html):
    return bool(re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=', html, re.I))


def has_og(html):
    return all(re.search(rf'<meta[^>]+(property|name)=["\']{t}["\']', html, re.I) for t in
               ["og:title", "og:description", "og:image"])


def has_fonts(html):
    return all(f in html for f in FONTS)


def has_css(html):
    return bool(re.search(r'<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\'][^"\']*\.css', html, re.I))


def has_error(html):
    low = html.lower()
    return any(e in low for e in ERROR_TEXTS)


def main():
    print(f"BASE={BASE}")
    results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as ex:
        futs = {p: ex.submit(fetch, urljoin(BASE, p)) for p in ALL + STATICS}
        for p, f in futs.items():
            results[p] = f.result()

    checks = []  # (category, item, passed, detail)
    def rec(cat, item, ok, detail=""):
        checks.append((cat, item, ok, detail))

    for p in ALL:
        r = results[p]
        ok = r["status"] == 200
        rec("1.HTTP", p, ok, f"status={r['status']}" + (f" err={r['err']}" if not ok else ""))
        if not ok:
            continue
        html = r["content"]
        # title
        t = title_of(html)
        exp = EXPECT_TITLE.get(p)
        if exp:
            rec("2.Title", p, t == exp, f"'{t}'" + ("" if t == exp else f" != '{exp}'"))
        else:
            rec("2.Title", p, bool(t), f"'{t[:50]}'")
        # meta desc
        rec("3.MetaDesc", p, has_meta_desc(html))
        # og
        rec("4.OG", p, has_og(html))
        # fonts
        rec("5.Fonts", p, has_fonts(html))
        # css link
        rec("6.CSS", p, has_css(html))
        # error boundary
        rec("7.NoError", p, not has_error(html), "ERROR TEXT FOUND!" if has_error(html) else "")

    for p in STATICS:
        r = results[p]
        rec("8.Static", p, r["status"] in (200, 304), f"status={r['status']}" + (f" err={r['err']}" if r["status"] not in (200,304) else ""))

    # report
    total = sum(1 for c in checks if c[0].split(".")[0] in ("1","2","3","4","5","6","7","8"))
    passed = sum(1 for c in checks if c[2])
    fails = [c for c in checks if not c[2]]
    print("\n" + "=" * 78)
    print("  REAL PRODUCTION VALIDATION")
    print("=" * 78)
    by_cat = {}
    for cat, item, ok, detail in checks:
        by_cat.setdefault(cat, [0, 0])
        by_cat[cat][0] += 1
        by_cat[cat][1] += 1 if ok else 0
    for cat in sorted(by_cat):
        n, p = by_cat[cat]
        print(f"  {cat:10} {p}/{n}")
    print(f"\n  OVERALL {passed}/{total}  ({passed/total*100:.1f}%)")
    if fails:
        print(f"\n  FAILURES ({len(fails)}):")
        for cat, item, ok, detail in fails:
            print(f"    ✗ [{cat}] {item}  {detail[:90]}")
    else:
        print("\n  ✅ ALL CHECKS PASSED")
    return 0 if not fails else 1


if __name__ == "__main__":
    sys.exit(main())
