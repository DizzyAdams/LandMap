#!/usr/bin/env python3
"""
Validate ALL routes on landmapprod.vercel.app against the Lovable reference.
Fetches EVERY route in parallel and checks 9 categories of compliance.
"""

import asyncio
import aiohttp
import re
import json
import sys
from urllib.parse import urljoin

BASE = "https://landmapprod.vercel.app"

# ── Routes to check ──────────────────────────────────────────────────
HOME_ROUTES = ["/pt-BR", "/en-US", "/es-ES"]
PT_ROUTES = [
    "/pt-BR/regions", "/pt-BR/favorites", "/pt-BR/compare", "/pt-BR/dashboard",
    "/pt-BR/admin", "/pt-BR/plans", "/pt-BR/auth", "/pt-BR/map", "/pt-BR/onboarding",
    "/pt-BR/world", "/pt-BR/insights", "/pt-BR/sales", "/pt-BR/terrenos",
    "/pt-BR/chat", "/pt-BR/search", "/pt-BR/calculator", "/pt-BR/studio",
    "/pt-BR/live", "/pt-BR/status",
]
ALL_ROUTES = HOME_ROUTES + PT_ROUTES
STATIC_ASSETS = [
    "/favicon.ico", "/favicon.svg", "/og-image.svg",
    "/landmap-lovabale-logo.png", "/manifest.json",
    "/icons/icon-192.svg", "/icons/icon-512.svg",
]

# ── Lovable reference expectations ───────────────────────────────────
LOVABLE_PAGE_TITLES = {
    "/pt-BR/regions": "Regiões — LandMap",
    "/pt-BR/favorites": "Favoritos — LandMap",
    "/pt-BR/compare": "Comparação de regiões — LandMap",
    "/pt-BR/admin": "Administração — LandMap",
    "/pt-BR/plans": "Planos — LandMap",
    "/pt-BR/auth": "Entrar — LandMap",
}
LOVABLE_PAGE_DESCS = {
    "/pt-BR/plans": "Escolha o plano LandMap ideal: Access, Plus, Pro ou Business.",
    "/pt-BR/auth": "Acesse a plataforma LandMap ou solicite acesso.",
    "/pt-BR/onboarding": "Como o LandMap ajuda você a decidir sobre terrenos com dados.",
}
ONBOARDING_TEXTS = [
    "Decisão com confiança",
    "Radar de oportunidades",
    "Todo o Brasil no mapa",
    "Valorização em tempo real",
]
ONBOARDING_EXTRA = ["Ver planos", "Já tenho conta"]
LOGO_PATH = "/landmap-lovabale-logo.png"

DESIGN_TOKENS = [
    "oklch(34% .18 265)",    # primary
    "oklch(100% 0 0)",      # background
    "oklch(18% .06 265)",   # foreground
    "oklch(50% .18 265)",   # ring
    "oklch(92% .015 250)",  # border
    "oklch(96% .01 250)",   # muted
    "var(--primary)",
    "var(--foreground)",
    "var(--ring)",
    "var(--border)",
    "var(--muted)",
    "var(--background)",
]

FONTS = ["DM Sans", "Space Grotesk", "JetBrains Mono"]


# ── Shared session ───────────────────────────────────────────────────
async def fetch(session, path, timeout=15):
    url = urljoin(BASE, path)
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=timeout),
                               allow_redirects=True,
                               headers={"User-Agent": "Mozilla/5.0 (compatible; RouteValidator/1.0)"}) as resp:
            content = await resp.text()
            ct = resp.headers.get("Content-Type", "")
            return {"path": path, "url": str(resp.url), "status": resp.status,
                    "content": content, "type": ct, "ok": True}
    except Exception as e:
        return {"path": path, "status": 0, "content": "", "error": str(e), "ok": False}


async def fetch_head(session, path, timeout=10):
    """Fetch only headers to check availability (for static assets)."""
    url = urljoin(BASE, path)
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=timeout),
                               allow_redirects=True,
                               headers={"User-Agent": "Mozilla/5.0"}) as resp:
            return {"path": path, "status": resp.status, "ok": True}
    except Exception as e:
        return {"path": path, "status": 0, "error": str(e), "ok": False}


# ── Checkers ─────────────────────────────────────────────────────────
def check_title(html: str, path: str):
    m = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
    if not m:
        return False, "NO <title> tag found"
    title = m.group(1).strip()
    expected = LOVABLE_PAGE_TITLES.get(path)
    if expected:
        if title == expected:
            return True, title
        else:
            return False, f"Expected '{expected}', got '{title}'"
    return True, title  # no specific expectation, just present


def check_meta_desc(html: str, path: str):
    m = re.search(r'<meta\s+[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)
    if not m:
        return False, "NO meta description found"
    desc = m.group(1).strip()
    expected = LOVABLE_PAGE_DESCS.get(path)
    if expected:
        if desc == expected:
            return True, desc
        else:
            return False, f"Expected '{expected}', got '{desc}'"
    return True, desc


def check_og_tags(html: str):
    required = ["og:title", "og:description", "og:image"]
    found = []
    for tag in required:
        pattern = rf'<meta\s+[^>]*property=["\']{re.escape(tag)}["\'][^>]*content=["\'](.*?)["\']'
        m = re.search(pattern, html, re.IGNORECASE)
        if m:
            found.append((tag, m.group(1)))
    passed = len(found) == len(required)
    return passed, found


def check_design_tokens(html: str):
    found_tokens = []
    missing_tokens = []
    for token in DESIGN_TOKENS:
        if token in html:
            found_tokens.append(token)
        else:
            missing_tokens.append(token)
    return len(found_tokens), len(missing_tokens), missing_tokens


def check_fonts(html: str):
    found_fonts = []
    missing_fonts = []
    for font in FONTS:
        # Check in <link> for Google Fonts, or in CSS @import, or in inline style
        if font in html:
            found_fonts.append(font)
        else:
            missing_fonts.append(font)
    return found_fonts, missing_fonts


def check_onboarding(html: str):
    results = {}
    for text in ONBOARDING_TEXTS:
        results[text] = text in html
    for text in ONBOARDING_EXTRA:
        results[text] = text in html
    return results


# ── Main validator ───────────────────────────────────────────────────
async def main():
    print("=" * 72)
    print(f"  LandMap Route Validation Report")
    print(f"  Target: {BASE}")
    print("=" * 72)

    all_results = {}
    all_passed = []
    all_failed = []

    def record(category, item, passed, detail=""):
        all_results.setdefault(category, []).append((item, passed, detail))
        if passed:
            all_passed.append((category, item))
        else:
            all_failed.append((category, item))

    async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(limit=50)) as session:
        # ── Phase 1: Fetch all HTML routes in parallel ──
        print("\n[Phase 1] Fetching all routes...")
        tasks = [fetch(session, p) for p in ALL_ROUTES]
        route_responses = await asyncio.gather(*tasks)

        for resp in route_responses:
            p = resp["path"]
            ok = resp["ok"]
            status = resp["status"]

            # 1. HTTP Status
            record("1. HTTP Status", p, ok and status == 200,
                   f"Status={status}" if ok else f"ERROR: {resp.get('error')}")

            if not ok or status != 200:
                continue  # skip deeper checks for failed routes

            html = resp["content"]

            # 2. Page title
            title_ok, title_val = check_title(html, p)
            record("2. Page Title", p, title_ok, title_val)

            # 3. Meta description
            desc_ok, desc_val = check_meta_desc(html, p)
            record("3. Meta Description", p, desc_ok, desc_val)

            # 4. OG tags
            og_ok, og_found = check_og_tags(html)
            og_detail = "; ".join([f"{t}={v}" for t, v in og_found]) if og_found else "None found"
            record("4. OG Tags", p, og_ok, og_detail)

        # ── Phase 2: Check static assets ──
        print("\n[Phase 2] Checking static assets...")
        asset_tasks = [fetch_head(session, p) for p in STATIC_ASSETS]
        asset_responses = await asyncio.gather(*asset_tasks)

        for resp in asset_responses:
            p = resp["path"]
            ok = resp["ok"]
            status = resp["status"]
            record("7. Static Assets", p, ok and status == 200,
                   f"Status={status}" if ok else f"ERROR: {resp.get('error')}")

        # ── Phase 3: Deeper checks on /pt-BR (home page representative) ──
        print("\n[Phase 3] Deep design/font checks...")
        home_resp = next((r for r in route_responses if r["path"] == "/pt-BR"), None)

        if home_resp and home_resp["ok"] and home_resp["status"] == 200:
            html = home_resp["content"]

            # 5. Design tokens
            tok_found, tok_miss, tok_missing_list = check_design_tokens(html)
            record("5. Design Tokens", "/pt-BR (CSS)", tok_found >= 6,
                   f"{tok_found}/{len(DESIGN_TOKENS)} found. Missing: {tok_missing_list[:5]}...")
            for t in tok_missing_list:
                record("5. Design Tokens (detail)", t, False, "missing from HTML")

            # 6. Font references
            fonts_found, fonts_missing = check_fonts(html)
            record("6. Fonts", "/pt-BR", len(fonts_found) == len(FONTS),
                   f"Found: {fonts_found}, Missing: {fonts_missing}")

        # ── Phase 4: Onboarding deep check ──
        print("\n[Phase 4] Onboarding page deep check...")
        onb_resp = next((r for r in route_responses if r["path"] == "/pt-BR/onboarding"), None)
        if onb_resp and onb_resp["ok"] and onb_resp["status"] == 200:
            onb_html = onb_resp["content"]
            onb_checks = check_onboarding(onb_html)
            all_onb_pass = all(onb_checks.values())
            detail = "; ".join([f"'{k}': {'✓' if v else '✗'}" for k, v in onb_checks.items()])
            record("8. Onboarding Page", "/pt-BR/onboarding", all_onb_pass, detail)
        else:
            record("8. Onboarding Page", "/pt-BR/onboarding", False,
                   onb_resp.get("error", f"Status={onb_resp['status']}" if onb_resp else "No response"))

        # ── Phase 5: Logo deep check ──
        print("\n[Phase 5] Logo verification...")
        logo_resp = next((r for r in asset_responses if r["path"] == LOGO_PATH), None)
        if logo_resp and logo_resp["ok"]:
            record("9. Logo", LOGO_PATH, logo_resp["status"] == 200,
                   f"Status={logo_resp['status']}")
        else:
            record("9. Logo", LOGO_PATH, False,
                   logo_resp.get("error", "Failed to fetch") if logo_resp else "Not checked")

    # ── Report ────────────────────────────────────────────────────────
    print("\n" + "=" * 72)
    print("  FINAL VALIDATION REPORT")
    print("=" * 72)

    categories = list(dict.fromkeys([k for k, _ in all_passed] + [k for k, _ in all_failed]))
    grand_total = 0
    grand_passed = 0

    for cat in categories:
        items = all_results.get(cat, [])
        cat_pass = sum(1 for _, p, _ in items if p)
        cat_total = len(items)
        grand_total += cat_total
        grand_passed += cat_pass

        print(f"\n  {cat}  ({cat_pass}/{cat_total} passed)")
        print(f"  {'─' * (len(cat) + 20)}")
        for item, passed, detail in items:
            icon = "✓" if passed else "✗"
            print(f"    {icon} {item}")
            if not passed and detail:
                print(f"         ↳ {detail}")
            elif detail:
                print(f"         ↳ {detail[:120]}")

    print(f"\n  {'═' * 50}")
    print(f"  OVERALL: {grand_passed}/{grand_total} passed "
          f"({grand_passed/grand_total*100:.1f}%)")
    print(f"  {'═' * 50}")

    # Summary of failures
    if all_failed:
        print(f"\n  FAILURES ({len(all_failed)}):")
        for cat, item in all_failed:
            items = all_results.get(cat, [])
            detail = next((d for i, p, d in items if i == item and not p), "")
            print(f"    ✗ [{cat}] {item}")
            if detail:
                print(f"      {detail[:150]}")

    print()
    return grand_passed, grand_total


if __name__ == "__main__":
    asyncio.run(main())
