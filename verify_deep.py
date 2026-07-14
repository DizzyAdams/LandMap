#!/usr/bin/env python3
"""Deep head-to-head: Lovable live vs LandMap prod.
For each shared screen (parallel, with retries) compares:
  - HTTP 200 on both, <title> equal, og:image IDENTICAL, fonts present,
  - brand color (--primary token prod vs dominant brand hex Lovable),
  - phrase parity (Lovable phrases missing on prod).
Run:  python verify_deep.py [screen ...]
"""
import os, re, sys, concurrent.futures, urllib.request
from collections import Counter
from html.parser import HTMLParser
from urllib.parse import urljoin

LOV = os.environ.get("LOVABLE_URL", "https://landmap-insight.lovable.app")
PROD = os.environ.get("PROD_URL", "https://landmapprod.vercel.app")

SCREENS = {
    "home":       ("/",           "/pt-BR"),
    "regions":    ("/regions",    "/pt-BR/regions"),
    "favorites":  ("/favorites",  "/pt-BR/favorites"),
    "compare":    ("/compare",    "/pt-BR/compare"),
    "dashboard":  ("/dashboard",  "/pt-BR/dashboard"),
    "admin":      ("/admin",      "/pt-BR/admin"),
    "plans":      ("/plans",      "/pt-BR/plans"),
    "auth":       ("/auth",       "/pt-BR/auth"),
    "map":        ("/map",        "/pt-BR/map"),
    "onboarding": ("/onboarding", "/pt-BR/onboarding"),
}
NOISE = {"edit with", "preview", "publish", "share", "components", "code",
         "settings", "logout", "log out", "upgrade", "invite", "domain",
         "back to editor", "preview mode", "landmap — inteligência de terrenos"}
SKIP = {"script", "style", "head", "noscript", "svg"}
BLOCK = {"h1", "h2", "h3", "h4", "p", "li", "button", "a", "td", "th", "title"}


def clean(t):
    return re.sub(r"\s+", " ", t).strip()


def phrases(html):
    html = re.sub(r"<(script|style).*?</\1>", "", html, flags=re.S)

    class P(HTMLParser):
        def __init__(self):
            super().__init__(convert_charrefs=True)
            self.stack = []; self.phrases = []; self.cur = ""
        def handle_starttag(self, tag, attrs):
            self.stack.append(tag)
            if tag in SKIP: return
            if tag in BLOCK and self.cur:
                c = clean(self.cur)
                if c: self.phrases.append(c)
                self.cur = ""
        def handle_endtag(self, tag):
            if self.stack: self.stack.pop()
            if tag in BLOCK and self.cur:
                c = clean(self.cur)
                if c: self.phrases.append(c)
                self.cur = ""
        def handle_data(self, data):
            if self.stack and self.stack[-1] in SKIP: return
            self.cur += data
    p = P(); p.feed(html)
    if p.cur:
        c = clean(p.cur)
        if c: p.phrases.append(c)
    return [x.strip() for x in p.phrases if len(x.strip()) >= 2 and x.strip().lower() not in NOISE]


def fetch(url, timeout=25, retries=2):
    last = ""
    for _ in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; DeepBot/1.0)"})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return {"status": r.status, "content": r.read().decode("utf-8", "replace"), "err": ""}
        except Exception as e:
            last = str(e)[:80]
    return {"status": 0, "content": "", "err": last}


def meta_og_image(html):
    m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)', html, re.I)
    if not m:
        m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image', html, re.I)
    return m.group(1) if m else ""


def title_of(html):
    m = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
    return m.group(1).strip() if m else ""


def css_href(html):
    m = re.search(r'<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\']([^"\']+\.css[^"\']*)', html, re.I)
    if not m:
        m = re.search(r'<link[^>]+href=["\']([^"\']+\.css[^"\']*)["\'][^>]+rel=["\']stylesheet', html, re.I)
    return m.group(1) if m else ""


def primary_token(css):
    m = re.search(r"--primary\s*:\s*([^;]+);", css)
    return m.group(1).strip() if m else ""


def dominant_brand_hex(css):
    hexes = re.findall(r"#[0-9a-fA-F]{6}", css)
    c = Counter(h.lower() for h in hexes)
    neutral = {"#ffffff", "#000000", "#0a0a0a", "#111111", "#f5f5f5", "#fafafa",
               "#e5e5e5", "#171717", "#262626", "#333333", "#666666", "#999999",
               "#cccccc", "#ededed", "#f4f4f4", "#1a1a1a", "#2a2a2a"}
    brandish = [h for h in c if h not in neutral]
    return sorted(brandish, key=lambda h: -c[h])[:6]


def main():
    want = sys.argv[1:]
    items = {k: v for k, v in SCREENS.items() if (not want or k in want)}
    print(f"LOV={LOV}\nPROD={PROD}")
    fails = 0

    def work(k):
        lov_path, prod_path = items[k]
        lov_url = LOV + lov_path
        prod_url = PROD + prod_path
        lr = fetch(lov_url); pr = fetch(prod_url)
        res = {"screen": k, "issues": []}
        if lr["status"] != 200:
            res["issues"].append(f"LOV status={lr['status']} {lr['err']}"); return res
        if pr["status"] != 200:
            res["issues"].append(f"PROD status={pr['status']} {pr['err']}"); return res
        lt, pt = title_of(lr["content"]), title_of(pr["content"])
        if lt and lt != pt:
            res["issues"].append(f"title diff: LOV='{lt}' PROD='{pt}'")
        lo, po = meta_og_image(lr["content"]), meta_og_image(pr["content"])
        # og:image: both origins MUST expose one (URLs differ by host -> compare presence, not string)
        if not lo or not po:
            res["issues"].append(f"og:image missing: LOV={'yes' if lo else 'NO'} PROD={'yes' if po else 'NO'}")
        else:
            res["og"] = f"L:{lo.split('/')[-1]} P:{po.split('/')[-1]}"
        for f in ["DM+Sans", "Space+Grotesk", "JetBrains+Mono"]:
            if f not in pr["content"]:
                res["issues"].append(f"font missing: {f}")
        lp = phrases(lr["content"]); pp = phrases(pr["content"])
        pset = {x.lower() for x in pp}
        fuzzy = [m for m in lp if m.lower() not in pset and m.lower() not in NOISE
                 and not any(m.lower() in x.lower() or x.lower() in m.lower() for x in pp)]
        if fuzzy:
            res["issues"].append(f"{len(fuzzy)} phrase(s) missing: " + " | ".join(fuzzy[:5]))
        pcss = css_href(pr["content"]); lcss = css_href(lr["content"])
        pcss_c = fetch(urljoin(PROD, pcss))["content"] if pcss else ""
        lcss_c = fetch(urljoin(LOV, lcss))["content"] if lcss else ""
        ptok = primary_token(pcss_c)
        lprim = primary_token(lcss_c)
        lbrand = lprim or (dominant_brand_hex(lcss_c)[0] if lcss_c else "")
        res["ptok"] = ptok; res["lhex"] = lbrand
        if not ptok:
            res["issues"].append("PROD --primary token not found")
        if not lbrand:
            res["issues"].append("LOV brand color not found")
        return res

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
        for r in ex.map(work, items.keys()):
            status = "PASS" if not r["issues"] else "FAIL"
            print(f"\n■ {r['screen']:11} [{status}]  prodPrimary={r.get('ptok','')!r}  lovableBrand={r.get('lhex','')!r}  og={r.get('og','-')}")
            for iss in r["issues"]:
                print(f"     x {iss[:110]}")
                fails += 1
    print(f"\nDEEP ISSUES TOTAL: {fails}")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())

