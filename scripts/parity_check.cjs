const { chromium } = require('playwright');

const LOV = "https://landmap-insight.lovable.app";
const VER = "https://web-knmjm0pa0-dizzys-projects-d5a44b36.vercel.app";
const ROUTES = ["/", "/regions", "/favorites", "/compare", "/dashboard", "/admin", "/plans", "/auth", "/map"];

async function render(page, url) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1200);
  return await page.evaluate(() => {
    const v = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const txt = (el) => (el.innerText || '').replace(/\s+/g, ' ').trim();
    const main = document.querySelector('main') || document.body;
    const headings = [...document.querySelectorAll('h1,h2,h3')].filter(v).map(e => ({ t: e.tagName, x: txt(e) }));
    const buttons = [...document.querySelectorAll('button,a')].filter(v).map(e => txt(e)).filter(Boolean);
    const imgs = [...document.querySelectorAll('img')].filter(v).length;
    const cards = document.querySelectorAll('[class*=card],[class*=Card]').length;
    return {
      title: document.title,
      url: location.pathname,
      h1: (document.querySelector('h1') && txt(document.querySelector('h1'))) || '',
      bodyText: txt(main).slice(0, 1500),
      headings,
      buttons: buttons.slice(0, 40),
      imgs, cards,
      len: txt(main).length
    };
  });
}

function norm(t) { return (t || '').replace(/\s*[-–—]\s*LandMap.*$/i, '').trim(); }

function diff(a, b) {
  const issues = [];
  for (const rt of ROUTES) {
    const la = a.lovable[rt] || {}; const va = b.vercel[rt] || {};
    if (la.error || va.error) { issues.push(`[${rt}] ERROR lov=${la.error} ver=${va.error}`); continue; }
    if (norm(la.title) !== norm(va.title)) issues.push(`[${rt}] TITLE lov=${JSON.stringify(la.title)} ver=${JSON.stringify(va.title)}`);
    if (la.h1 !== va.h1) issues.push(`[${rt}] H1 lov=${JSON.stringify(la.h1)} ver=${JSON.stringify(va.h1)}`);
    const ratio = (va.len + 1) / (la.len + 1);
    if (ratio < 0.5 || ratio > 2.0) issues.push(`[${rt}] BODYLEN lov=${la.len} ver=${va.len} (ratio ${ratio.toFixed(2)})`);
    if (la.headings.length !== va.headings.length) issues.push(`[${rt}] HEADINGS lov=${la.headings.length} ver=${va.headings.length}`);
  }
  return issues;
}

(async () => {
  const out = { lovable: {}, vercel: {} };
  const browser = await chromium.launch({ headless: true });
  for (const [name, base] of [["lovable", LOV], ["vercel", VER]]) {
    const pg = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    for (const rt of ROUTES) {
      try { out[name][rt] = await render(pg, base + rt); }
      catch (e) { out[name][rt] = { error: String(e).slice(0, 200) }; }
    }
    await pg.close();
  }
  await browser.close();
  require('fs').writeFileSync('C:/Users/forrydev/Desktop/LandMap/scripts/parity_data.json', JSON.stringify(out, null, 2), 'utf-8');
  const issues = diff(out, out);
  console.log("=== PARITY ISSUES (" + issues.length + ") ===");
  issues.forEach(i => console.log(i));
  console.log("\n=== LOVABLE REFERENCE (h1 | len | cards | imgs) ===");
  for (const rt of ROUTES) {
    const d = out.lovable[rt] || {};
    console.log(`${rt.padEnd(12)} h1=${JSON.stringify(d.h1)} len=${d.len} cards=${d.cards} imgs=${d.imgs}`);
  }
  console.log("\n=== VERCEL (h1 | len | cards | imgs) ===");
  for (const rt of ROUTES) {
    const d = out.vercel[rt] || {};
    console.log(`${rt.padEnd(12)} h1=${JSON.stringify(d.h1)} len=${d.len} cards=${d.cards} imgs=${d.imgs}`);
  }
})();
