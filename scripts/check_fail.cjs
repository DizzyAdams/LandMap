const { chromium } = require('playwright');
const URL = "https://landmapprod.vercel.app/pt-BR/map";
(async () => {
  const browser = await chromium.launch({ headless: true });
  const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const failed = [];
  pg.on('response', r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
  pg.on('requestfailed', r => failed.push(`FAIL ${r.failure()?.errorText} ${r.url()}`));
  await pg.goto(URL, { waitUntil: "networkidle", timeout: 45000 });
  await pg.waitForTimeout(3000);
  console.log("=== failed/4xx/5xx resource URLs ===");
  console.log(failed.join("\n") || "(none)");
  await browser.close();
})();
