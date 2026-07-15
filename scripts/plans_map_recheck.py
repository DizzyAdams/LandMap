import json, time
from playwright.sync_api import sync_playwright
BASE = "https://landmap.us.kg"
TARGETS = ["/plans", "/map"]
RES = []

def probe(b, url, tag):
    ctx = b.new_context(reduced_motion="reduce" if tag == "REDUCED" else None)
    pg = ctx.new_page()
    last = None
    for attempt in range(3):
        try:
            pg.goto(url, wait_until="domcontentloaded", timeout=45000)
            pg.wait_for_selector("[class*='animate-in']", state="attached", timeout=20000)
            pg.wait_for_timeout(150)
            t0 = pg.evaluate(
                "()=>{const e=document.querySelector(\"[class*='animate-in']\");"
                "return e?parseFloat(getComputedStyle(e).opacity):null;}")
            pg.wait_for_timeout(1800)
            t1 = pg.evaluate(
                "()=>{const e=document.querySelector(\"[class*='animate-in']\");"
                "return e?parseFloat(getComputedStyle(e).opacity):null;}")
            RES.append({"url": url, "mode": tag, "T0": t0, "T1": t1, "visible": t1 == 1})
            print(f"[{tag}] {url:22s} T0={t0} T1={t1} {'OK' if t1==1 else 'BROKEN'}")
            ctx.close(); return
        except Exception as e:
            last = str(e)[:80]; time.sleep(3)
    RES.append({"url": url, "mode": tag, "error": last}); print(f"[{tag}] {url:22s} ERR {last}")
    ctx.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        b = p.chromium.launch()
        for tag in ["MOTION", "REDUCED"]:
            print(f"\n=== {tag} ===")
            for t in TARGETS:
                probe(b, BASE + "/pt-BR" + t, tag)
        b.close()
    json.dump(RES, open("scripts/plans_map_recheck.json", "w"), indent=2)
    bad = [r for r in RES if ("visible" in r and not r["visible"]) or "error" in r]
    print("\nALL OK:", not bad, bad)
