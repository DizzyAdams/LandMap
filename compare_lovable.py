#!/usr/bin/env python3
"""
Structural parity check: LandMap (React, live prod) vs Lovable HTML references.
Extracts visible semantic content (h1-h3, button/CTA text, list items, links,
paragraphs) from each Lovable reference and from the deployed /pt-BR route, then
reports which Lovable phrases are MISSING on the React side.

Run:  python compare_lovable.py [screen]   (no arg = all)
BASE = env VAL_BASE_URL or https://landmapprod.vercel.app
"""
import os, re, sys, concurrent.futures
from html.parser import HTMLParser
from urllib.parse import urljoin, urljoin as _uj
import urllib.request

ROOT = r"C:\Users\forrydev\Desktop\LandMap\apps\web\public"
BASE = os.environ.get("VAL_BASE_URL", "https://landmapprod.vercel.app")
if not BASE.startswith("http"):
    BASE = "http://" + BASE

SCREENS = {
    "home":        ("lovable_html_map.html",     "/pt-BR"),
    "regions":     ("lovable_html_regions.html", "/pt-BR/regions"),
    "favorites":   ("lovable_html_favorites.html", "/pt-BR/favorites"),
    "compare":     ("lovable_html_compare.html", "/pt-BR/compare"),
    "dashboard":   ("lovable_html_dashboard.html", "/pt-BR/dashboard"),
    "admin":       ("lovable_html_admin.html",   "/pt-BR/admin"),
    "plans":       ("lovable_html_plans.html",   "/pt-BR/plans"),
    "auth":        ("lovable_html_auth.html",    "/pt-BR/auth"),
    "map":         ("lovable_html_map.html",     "/pt-BR/map"),
    "onboarding":  ("lovable_html_onboarding.html", "/pt-BR/onboarding"),
}

SKIP = {"script", "style", "head", "noscript", "svg"}
MEANINGFUL = {"h1", "h2", "h3", "h4", "p", "button", "a", "li", "td", "th",
              "span", "label", "strong", "b", "title", "meta"}


def clean(t):
    t = re.sub(r"\s+", " ", t).strip()
    return t


class VExtract(HTMLParser):
    """Collect ordered visible text phrases from semantic elements."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.phrases = []
        self.cur = ""

    def handle_starttag(self, tag, attrs):
        self.stack.append(tag)
        if tag in SKIP:
            return
        # block-level: flush current buffer as a phrase
        if tag in {"h1", "h2", "h3", "h4", "p", "li", "button", "a", "td", "th", "title"}:
            if self.cur:
                c = clean(self.cur)
                if c:
                    self.phrases.append(c)
                self.cur = ""

    def handle_endtag(self, tag):
        if self.stack:
            self.stack.pop()
        if tag in {"h1", "h2", "h3", "h4", "p", "li", "button", "a", "td", "th", "title"}:
            if self.cur:
                c = clean(self.cur)
                if c:
                    self.phrases.append(c)
                self.cur = ""

    def handle_data(self, data):
        if self.stack and self.stack[-1] in SKIP:
            return
        self.cur += data


def phrases_from_html(html):
    html = re.sub(r"<script.*?</script>", "", html, flags=re.S)
    html = re.sub(r"<style.*?</style>", "", html, flags=re.S)
    p = VExtract()
    p.feed(html)
    if p.cur:
        c = clean(p.cur)
        if c:
            p.phrases.append(c)
    # normalize
    out = []
    for ph in p.phrases:
        ph = ph.strip()
        if len(ph) < 2:
            continue
        out.append(ph)
    return out


def norm_set(phrases):
    s = set()
    for ph in phrases:
        s.add(ph.lower())
        # also add word-unigram-light tokens for fuzzy matching? keep full phrases
    return s


def fetch(session, path, timeout=20):
    url = urljoin(BASE, path)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; ParityBot/1.0)"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return {"path": path, "status": resp.status, "content": resp.read().decode("utf-8", "replace"), "ok": True, "error": ""}
    except Exception as e:
        return {"path": path, "status": 0, "content": "", "error": str(e), "ok": False}


def main():
    want = sys.argv[1:]
    if want:
        items = {k: v for k, v in SCREENS.items() if k in want}
    else:
        items = SCREENS

    print(f"BASE={BASE}")
    routes = {k: v[1] for k, v in items.items()}
    live = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
        futs = {k: ex.submit(fetch, None, path) for k, path in routes.items()}
        for k, fut in futs.items():
            r = fut.result()
            live[k] = r
            print(f"  fetch {k:10} {routes[k]:18} status={r['status']}  err={r['error'][:60]}")

    report = {}
    for k, (fname, path) in items.items():
        fpath = os.path.join(ROOT, fname)
        if not os.path.exists(fpath):
            report[k] = ("MISSING_REF", [], [])
            continue
        lov = phrases_from_html(open(fpath, encoding="utf-8", errors="replace").read())
        lv = live.get(k, {})
        if not lv.get("ok") or lv.get("status") != 200:
            report[k] = (f"LIVE_{lv.get('status', 'ERR')}", lov, [])
            continue
        prod = phrases_from_html(lv["content"])
        lov_set = norm_set(lov)
        prod_set = norm_set(prod)
        # missing = lovable phrases not present verbatim in prod
        missing = sorted([p for p in lov if p.lower() not in prod_set])
        # extras = prod phrases not in lovable (informational, often nav/footer)
        report[k] = (f"OK({len(lov)} lov / {len(prod)} prod)", lov, missing)

    print("\n" + "=" * 78)
    print("  STRUCTURAL PARITY REPORT  (Lovable phrases missing on React side)")
    print("=" * 78)
    total_missing = 0
    for k, (status, lov, missing) in report.items():
        print(f"\n■ {k:10}  [{status}]  missing={len(missing)}")
        for m in missing[:40]:
            print(f"     ✗ {m[:96]}")
        total_missing += len(missing)
    print(f"\nTOTAL MISSING PHRASES: {total_missing}")
    return total_missing


if __name__ == "__main__":
    main()
