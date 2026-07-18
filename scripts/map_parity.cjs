const { chromium } = require('playwright');

const LOV = "https://landmap-insight.lovable.app/map";
const VER = "https://landmapprod.vercel.app/pt-BR/map";
const OUT = "C:/Users/forrydev/Desktop/LandMap/scripts";

function norm(t) { return (t || '').replace(/\s*[-–—]\s*LandMap.*$/i, '').trim(); }

async function render(page, url, name) {
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0,160)); });
  page.on('pageerror', e => errors.push('PAGEERR ' + e.message.slice(0,160)));
  await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(2000);
  const data = await page.evaluate(() => {
    const v = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const txt = (el) => (el.innerText || '').replace(/\s+/g, ' ').trim();
    const main = document.querySelector('main') || document.body;
    const headings = [...document.querySelectorAll('h1,h2,h3,h4')].filter(v).map(e => ({ t: e.tagName, x: txt(e) }));
    const buttons = [...document.querySelectorAll('button,a')].filter(v).map(e => txt(e)).filter(Boolean);
    const cards = document.querySelectorAll('[class*=card],[class*=Card]').length;
    const canvas = document.querySelectorAll('canvas').length;
    const leaflet = document.querySelectorAll('.leaflet-container, .leaflet-map-pane, [class*=leaflet]').length;
    const svgs = document.querySelectorAll('svg').length;
    const panels = [...document.querySelectorAll('aside, [role=complementary], [class*=panel],[class*=Panel]')].filter(v).length;
    const inputs = document.querySelectorAll('input,select').length;
    return {
      title: document.title,
      h1: (document.querySelector('h1') && txt(document.querySelector('h1'))) || '',
      bodyText: txt(main).slice(0, 2200),
      headings,
      buttons: [...new Set(buttons)].slice(0, 60),
      cards, canvas, leaflet, svgs, panels, inputs,
      len: txt(main).length
    };
  });
  await page.screenshot({ path: `${OUT}/map_${name}.png`, fullPage: false });
  data.errors = errors;
  return data;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const out = {};
  for (const [name, url] of [["lovable", LOV], ["prod", VER]]) {
    try { out[name] = await render(pg, url, name); }
    catch (e) { out[name] = { error: String(e).slice(0, 300) }; }
  }
  await browser.close();
  require('fs').writeFileSync(`${OUT}/map_parity_data.json`, JSON.stringify(out, null, 2), 'utf-8');

  const L = out.lovable || {}, V = out.prod || {};
  console.log("=== /map PARITY (Lovable vs landmapprod) ===\n");
  console.log("LOV  title:", JSON.stringify(norm(L.title)), "| h1:", JSON.stringify(L.h1), "| len:", L.len, "| cards:", L.cards, "| canvas:", L.canvas, "| leaflet:", L.leaflet, "| panels:", L.panels, "| inputs:", L.inputs, "| svgs:", L.svgs);
  console.log("PROD title:", JSON.stringify(norm(V.title)), "| h1:", JSON.stringify(V.h1), "| len:", V.len, "| cards:", V.cards, "| canvas:", V.canvas, "| leaflet:", V.leaflet, "| panels:", V.panels, "| inputs:", V.inputs, "| svgs:", V.svgs);

  console.log("\n--- HEADINGS ---");
  console.log("LOV :", L.headings ? L.headings.map(h => `${h.t}:${h.x}`).join(" | ") : "n/a");
  console.log("PROD:", V.headings ? V.headings.map(h => `${h.t}:${h.x}`).join(" | ") : "n/a");

  console.log("\n--- BUTTONS/LINKS (set) ---");
  console.log("LOV :", L.buttons ? L.buttons.join(" | ") : "n/a");
  console.log("PROD:", V.buttons ? V.buttons.join(" | ") : "n/a");

  // overlap of buttons
  if (L.buttons && V.buttons) {
    const lset = new Set(L.buttons.map(b => b.toLowerCase()));
    const missing = V.buttons.filter(b => !lset.has(b.toLowerCase()));
    console.log("\nPROD buttons not in LOV set:", missing.join(" | ") || "(none)");
  }

  console.log("\n--- ERRORS ---");
  console.log("LOV errs:", (L.errors||[]).slice(0,8).join(" || ") || "none");
  console.log("PROD errs:", (V.errors||[]).slice(0,8).join(" || ") || "none");
  console.log("\nScreenshots: map_lovable.png, map_prod.png");
})();
