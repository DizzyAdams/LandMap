
import asyncio, json, re
from playwright.async_api import async_playwright

LOV = "https://landmap-insight.lovable.app"
LOCAL = "http://localhost:3000"
ROUTES = ["/", "/regions", "/favorites", "/compare", "/dashboard", "/admin", "/plans", "/auth", "/map"]

async def render(page, url):
    await page.goto(url, wait_until="networkidle", timeout=45000)
    await page.wait_for_timeout(1500)
    return await page.evaluate("""() => {
        const v = (el)=>{ const r=el.getBoundingClientRect(); const s=getComputedStyle(el);
            return r.width>0 && r.height>0 && s.visibility!=='hidden' && s.display!=='none'; };
        const txt = (el)=> (el.innerText||'').replace(/\\s+/g,' ').trim();
        const main = document.querySelector('main') || document.body;
        const headings = [...document.querySelectorAll('h1,h2,h3')].filter(v).map(e=>({t:e.tagName, x:txt(e)}));
        const buttons = [...document.querySelectorAll('button,a')].filter(v).map(e=>txt(e)).filter(Boolean);
        const imgs = [...document.querySelectorAll('img')].filter(v).length;
        const cards = document.querySelectorAll('[class*=card],[class*=Card]').length;
        return {
            title: document.title,
            url: location.pathname,
            h1: (document.querySelector('h1')&&txt(document.querySelector('h1')))||'',
            bodyText: txt(main).slice(0,2500),
            headings,
            buttons: buttons.slice(0,40),
            imgs, cards,
            len: txt(main).length
        };
    }""")

def norm(t): return re.sub(r"\s*[-–—]\s*LandMap.*$","",t or "",flags=re.I).strip()

async def run():
    out = {"lovable":{}, "local":{}}
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        pg = await b.new_page(viewport={"width":1280,"height":900})
        for rt in ROUTES:
            try: out["lovable"][rt] = await render(pg, LOV+rt)
            except Exception as e: out["lovable"][rt] = {"error": str(e)[:300]}
        # local needs locale prefix except root
        for rt in ROUTES:
            local_url = LOCAL + ("/pt-BR"+rt if rt!="/" else "/pt-BR/")
            try: out["local"][rt] = await render(pg, local_url)
            except Exception as e: out["local"][rt] = {"error": str(e)[:300]}
        await b.close()
    return out

def diff(a,b):
    issues=[]
    for rt in ROUTES:
        la=a.get(rt,{}); va=b.get(rt,{})
        if "error" in la or "error" in va:
            issues.append(f"[{rt}] ERROR lov={la.get('error')} | loc={va.get('error')}")
            continue
        # auth redirect detection: if both end on auth, skip content diff
        if "/auth" in la.get("url","") and "/auth" in va.get("url",""):
            continue
        if norm(la.get("title","")) != norm(va.get("title","")):
            issues.append(f"[{rt}] TITLE lov={la.get('title')!r} loc={va.get('title')!r}")
        if la.get("h1","") != va.get("h1",""):
            issues.append(f"[{rt}] H1 lov={la.get('h1')!r} loc={va.get('h1')!r}")
        ratio=(va.get("len",0)+1)/(la.get("len",0)+1)
        if ratio<0.6 or ratio>1.6:
            issues.append(f"[{rt}] BODYLEN lov={la.get('len')} loc={va.get('len')} ratio={ratio:.2f}")
        if len(la.get("headings",[])) != len(va.get("headings",[])):
            issues.append(f"[{rt}] HEADINGS lov={len(la.get('headings',[]))} loc={len(va.get('headings',[]))}")
        # CTA diff
        for btn in la.get("buttons",[]):
            if btn and btn not in va.get("buttons",[]) and len(btn)>1:
                issues.append(f"[{rt}] LOVABLE-ONLY btn: {btn!r}")
        for btn in va.get("buttons",[]):
            if btn and btn not in la.get("buttons",[]) and len(btn)>1:
                issues.append(f"[{rt}] LOCAL-ONLY btn: {btn!r}")
    return issues

if __name__=="__main__":
    data=asyncio.run(run())
    with open(r"scripts/parity_live.json","w",encoding="utf-8") as f:
        json.dump(data,f,ensure_ascii=False,indent=2)
    issues=diff(data["lovable"],data["local"])
    print("=== PARITY ISSUES (",len(issues),") ===")
    for i in issues: print(i)
    print("\n=== ROUTE SUMMARY ===")
    for rt in ROUTES:
        la=data["lovable"].get(rt,{}); va=data["local"].get(rt,{})
        print(f"{rt:10} lov_url={la.get('url'):18} loc_url={va.get('url'):18} lov_h1={la.get('h1')!r} loc_h1={va.get('h1')!r} lov_len={la.get('len')} loc_len={va.get('len')}")
