// Temp build helper: adiciona extensão .js a imports/exports relativos no
// dist do @landmap/invest para torná-lo consumível por consumidores NodeNext
// (ex.: @landmap/api, que usa moduleResolution: NodeNext). Não altera o source.
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('packages/invest/dist');
const KNOWN = /\.(js|json|mjs|cjs|css|svg|map)$/;

function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) {
      walk(p);
    } else if (/\.(js|d\.ts)$/.test(f)) {
      let t = fs.readFileSync(p, 'utf8');
      t = t.replace(/(['"])((?:\.\.?\/)[^'"]*)\1/g, (_m, q, rel) => {
        if (KNOWN.test(rel)) return _m;
        return `${q}${rel}.js${q}`;
      });
      fs.writeFileSync(p, t);
    }
  }
}

walk(dir);
console.log('rewrote relative imports in', dir);
