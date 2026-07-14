#!/usr/bin/env python3
"""Extract a compact structural skeleton from each Lovable HTML reference.
Shows section/heading/CTA/text order so we can reconcile React pages 1:1.
Run: python extract_lovable.py [screen]  (no arg = all known screens)"""
import os, re, sys, glob
from html.parser import HTMLParser

ROOT = r"C:\Users\forrydev\Desktop\LandMap\apps\web\public"
SCREENS = {
    "regions": "lovable_html_regions.html",
    "favorites": "lovable_html_favorites.html",
    "compare": "lovable_html_compare.html",
    "dashboard": "lovable_html_dashboard.html",
    "admin": "lovable_html_admin.html",
    "plans": "lovable_html_plans.html",
    "auth": "lovable_html_auth.html",
    "map": "lovable_html_map.html",
    "onboarding": "lovable_html_onboarding.html",
}

VOID = {"meta", "link", "img", "br", "hr", "input", "source", "area", "base", "col", "embed", "param", "track", "wbr"}
SKIP_TEXT_TAGS = {"script", "style", "head"}
MEANINGFUL = {"div", "section", "header", "main", "footer", "nav", "aside",
              "h1", "h2", "h3", "h4", "h5", "h6", "p", "button", "a",
              "ul", "ol", "li", "span", "label", "table", "thead", "tbody",
              "tr", "th", "td", "form", "article", "svg", "img"}


class Skeleton(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.lines = []
        self.stack = []
        self.cur_text = ""

    def handle_starttag(self, tag, attrs):
        if tag in SKIP_TEXT_TAGS:
            self.stack.append(tag)
            return
        if tag in VOID:
            return
        cls = dict(attrs).get("class", "")
        cls = " ".join(cls.split()[:6])
        cls = cls[:70]
        self.stack.append(tag)
        if tag in MEANINGFUL and self.depth <= 7:
            self.lines.append(("  " * self.depth) + f"<{tag} class='{cls}'>")
            self.depth += 1

    def handle_endtag(self, tag):
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()
        if tag in MEANINGFUL and self.depth > 0:
            self.depth -= 1

    def handle_data(self, data):
        if self.stack and self.stack[-1] in SKIP_TEXT_TAGS:
            return
        t = data.strip()
        if not t:
            return
        if self.depth > 0 and self.depth <= 7:
            txt = t[:48].replace("\n", " ")
            self.lines.append(("  " * self.depth) + f"· {txt}")


def extract(name, fname):
    path = os.path.join(ROOT, fname)
    if not os.path.exists(path):
        return [f"[{name}] MISSING {fname}"]
    html = open(path, encoding="utf-8", errors="ignore").read()
    # strip style/script bodies
    html = re.sub(r"<style.*?</style>", "", html, flags=re.S)
    html = re.sub(r"<script.*?</script>", "", html, flags=re.S)
    p = Skeleton()
    p.feed(html)
    return [f"===================== {name} ({fname}) ====================="] + p.lines


def main():
    want = sys.argv[1:] or list(SCREENS.keys())
    out = []
    for s in want:
        if s in SCREENS:
            out += extract(s, SCREENS[s])
    print("\n".join(out))

if __name__ == "__main__":
    main()
