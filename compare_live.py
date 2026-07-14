#!/usr/bin/env python3
"""
Authoritative parity check: LIVE Lovable (landmap-insight.lovable.app)
vs LIVE LandMap prod (landmapprod.vercel.app).

Extracts visible text phrases (h1-h4, p, li, button, a labels, th/td)
from each origin and reports which Lovable phrases are missing on prod.
Excludes Lovable editor noise ("Edit with", "Preview", etc.).

Run:  python compare_live.py [screen]
LOV = env LOVABLE_URL  (default https://landmap-insight.lovable.app)
PROD= env PROD_URL     (default https://landmapprod.vercel.app)
"""
import os, re, sys, concurrent.futures, urllib.request
from html.parser import HTMLParser

LOV = os.environ.get("LOVABLE_URL", "https://landmap-insight.lovable.app")
PROD = os.environ.get("PROD_URL", "https://landmapprod.vercel.app")

# Lovable editor noise that must never be treated as product content
NOISE = {"edit with", "preview", "publish", "share", "components", "code",
         "settings", "logout", "log out", "upgrade", "invite", "domain",
         "back to editor", "preview mode", "landmap — inteligência de terrenos"}

SCREENS = {
    "home":      ("/",            "/pt-BR"),
    "regions":   ("/regions",     "/pt-BR/regions"),
    "favorites": ("/favorites",   "/pt-BR/favorites"),
    "compare":   ("/compare",     "/pt-BR/compare"),
    "dashboard": ("/dashboard",   "/pt-BR/dashboard"),
    "admin":     ("/admin",       "/pt-BR/admin"),
    "plans":     ("/plans",       "/pt-BR/plans"),
    "auth":      ("/auth",        "/pt-BR/auth"),
    "map":       ("/map",         "/pt-BR/map"),
    "search":    ("/search",      "/pt-BR/search"),
    "onboarding":("/onboarding",  "/pt-BR/onboarding"),
    "insights":  ("/insights",    "/pt-BR/insights"),
    "sales":     ("/sales",       "/pt-BR/sales"),
    "terrenos":  ("/terrenos",    "/pt-BR/terrenos"),
    "calculator":("/calculator",  "/pt-BR/calculator"),
    "chat":      ("/chat",        "/pt-BR/chat"),
    "studio":    ("/studio",      "/pt-BR/studio"),
    "world":     ("/world",       "/pt-BR/world"),
    "live":      ("/live",        "/pt-BR/live"),
    "status":    ("/status",      "/pt-BR/status"),
}

SKIP = {"script", "style", "head", "noscript", "svg"}
BLOCK = {"h1", "h2", "h3", "h4", "p", "li", "button", "a", "td", "th", "title"}


def clean(t):
    return re.sub(r"\s+", " ", t).strip()


class V(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.phrases = []
        self.cur = ""

    def handle_starttag(self, tag, attrs):
        self.stack.append(tag)
        if tag in SKIP:
            return
        if tag in BLOCK:
            if self.cur:
                c = clean(self.cur)
                if c:
                    self.phrases.append(c)
                self.cur = ""

    def handle_endtag(self, tag):
        if self.stack:
            self.stack.pop()
        if tag in BLOCK:
            if self.cur:
                c = clean(self.cur)
                if c:
                    self.phrases.append(c)
                self.cur = ""

    def handle_data(self, data):
        if self.stack and self.stack[-1] in SKIP:
            return
        self.cur += data


def phrases(html):
    html = re.sub(r"<(script|style).*?</\1>", "", html, flags=re.S)
    p = V(); p.feed(html)
    if p.cur:
        c = clean(p.cur)
        if c:
            p.phrases.append(c)
    out = []
    for ph in p.phrases:
        ph = ph.strip()
        if len(ph) < 2:
            continue
        if ph.lower() in NOISE:
            continue
        out.append(ph)
    return out


def fetch(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; ParityBot/1.0)"})
        with urllib.request.urlopen(req, timeout=25) as r:
            return {"status": r.status, "content": r.read().decode("utf-8", "replace"), "err": ""}
    except Exception as e:
        return {"status": 0, "content": "", "err": str(e)[:80]}


def main():
    want = sys.argv[1:]
    items = {k: v for k, v in SCREENS.items() if (not want or k in want)}
    print(f"LOV={LOV}\nPROD={PROD}")

    def get_all(origin, items):
        res = {}
        with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:
            futs = {k: ex.submit(fetch, origin + v[0] if origin == LOV else PROD + v[1].split("/pt-BR", 1)[1]) for k, v in items.items()}
            for k, f in futs.items():
                res[k] = f.result()
        return res

    lov = get_all(LOV, items)
    prod = get_all(PROD, items)

    total_missing = 0
    print("\n" + "=" * 80)
    print("  HEAD-TO-HEAD PARITY  (Lovable phrase missing on prod)  — excluding editor noise")
    print("=" * 80)
    for k, (lovr, prodr) in [(k, (lov[k], prod[k])) for k in items]:
        lstat, pstat = lovr["status"], prodr["status"]
        print(f"\n■ {k:11}  lov={lstat} prod={pstat}")
        if lstat != 200:
            print(f"     ! Lovable unreachable: {lovr['err']}")
            continue
        if pstat != 200:
            print(f"     ! Prod route missing: {prodr['err']}")
            continue
        lp = phrases(lovr["content"])
        pp = phrases(prodr["content"])
        pset = {x.lower() for x in pp}
        miss = [x for x in lp if x.lower() not in pset and x.lower() not in NOISE]
        # also fuzzy: skip if a substring of any prod phrase
        fuzzy_miss = []
        for m in miss:
            if not any(m.lower() in x.lower() or x.lower() in m.lower() for x in pp):
                fuzzy_miss.append(m)
        for m in fuzzy_miss[:30]:
            print(f"     ✗ {m[:92]}")
        total_missing += len(fuzzy_miss)
    print(f"\nTOTAL MISSING (fuzzy): {total_missing}")


if __name__ == "__main__":
    main()
