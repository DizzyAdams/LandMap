#!/usr/bin/env node
/**
 * Local valuation regression runner — dependency-free smoke/eval for the
 * deployed `/value/realtime` engine. Reads datasets/valuation.json and asserts
 * each predicted price falls inside its expected band. Exits non-zero on any
 * failure so it can gate a deploy (CI / pre-Sunday check).
 *
 * Usage:
 *   node evals/run-valuation.mjs [--base URL]
 *   EVAL_API_BASE=http://localhost:3000 node evals/run-valuation.mjs
 *
 * Default base is the production deployment; override with --base or EVAL_API_BASE.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const BASE = (arg('base') || process.env.EVAL_API_BASE || 'https://landmap.us.kg').replace(/\/$/, '');
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

async function value(inputs) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(inputs)) p.set(k, String(v));
  const res = await fetch(`${BASE}/api/value/realtime?${p.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function main() {
  const ds = JSON.parse(readFileSync(join(__dirname, 'datasets', 'valuation.json'), 'utf-8'));
  console.log(`Valuation eval @ ${BASE}\n${ds.examples.length} casos\n`);

  let pass = 0;
  const fails = [];
  for (const ex of ds.examples) {
    const { areaM2, type } = ex.inputs;
    const { expectedMin, expectedMax } = ex.outputs;
    try {
      const r = await value(ex.inputs);
      const ok = r.predictedPrice >= expectedMin && r.predictedPrice <= expectedMax;
      const mark = ok ? '✓' : '✗';
      console.log(
        `${mark} ${type} ${areaM2}m² → ${brl.format(r.predictedPrice)} ` +
          `(banda ${brl.format(expectedMin)}–${brl.format(expectedMax)}, ${r.latencyUs}µs)`
      );
      if (ok) pass += 1;
      else fails.push({ inputs: ex.inputs, got: r.predictedPrice, expectedMin, expectedMax });
    } catch (err) {
      console.log(`✗ ${type} ${areaM2}m² → erro: ${err.message}`);
      fails.push({ inputs: ex.inputs, error: err.message });
    }
  }

  console.log(`\n${pass}/${ds.examples.length} dentro da banda.`);
  if (fails.length) {
    console.error('\nFalhas:');
    for (const f of fails) console.error(`  ${JSON.stringify(f)}`);
    process.exit(1);
  }
  console.log('✔ Todos os valores dentro da banda esperada.');
}

main().catch((err) => {
  console.error(`✖ ${err.message}`);
  process.exit(1);
});
