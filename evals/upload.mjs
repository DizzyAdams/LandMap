#!/usr/bin/env node
/**
 * Idempotent LangSmith dataset uploader — zero dependencies (uses global fetch +
 * the LangSmith REST API). Reads every manifest in ./datasets/*.json and
 * ensures the dataset exists, then bulk-uploads its examples.
 *
 * Each dataset file is a manifest:
 *   { "name", "description", "data_type", "examples": [{ inputs, outputs, metadata? }] }
 *
 * Auth: pass --api-key or set LANGSMITH_API_KEY.
 * Usage:
 *   node evals/upload.mjs [--api-key KEY] [--endpoint URL] [--replace] [--dry-run] [--only name]
 *
 * --replace : if a dataset already has examples, delete+recreate it first.
 * --dry-run : validate manifests and print the plan, upload nothing.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATASETS_DIR = join(__dirname, 'datasets');

function arg(name, fallback = undefined) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith('--') ? next : true;
}

const API_KEY = arg('api-key') || process.env.LANGSMITH_API_KEY;
const ENDPOINT = (arg('endpoint') || process.env.LANGSMITH_ENDPOINT || 'https://api.smith.langchain.com').replace(/\/$/, '');
const REPLACE = Boolean(arg('replace', false));
const DRY_RUN = Boolean(arg('dry-run', false));
const ONLY = arg('only');

if (!API_KEY && !DRY_RUN) {
  console.error('✖ LANGSMITH_API_KEY ausente. Use --api-key KEY ou defina a env var.');
  process.exit(1);
}

const headers = { 'Content-Type': 'application/json', 'x-api-key': API_KEY || '' };

async function api(path, init = {}) {
  const res = await fetch(`${ENDPOINT}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${init.method || 'GET'} ${path} → ${res.status} ${body.slice(0, 300)}`);
  }
  return res.status === 204 ? null : res.json();
}

function loadManifests() {
  const files = readdirSync(DATASETS_DIR).filter((f) => f.endsWith('.json'));
  return files.map((f) => {
    const m = JSON.parse(readFileSync(join(DATASETS_DIR, f), 'utf-8'));
    if (!m.name || !Array.isArray(m.examples)) {
      throw new Error(`Manifest inválido em ${f}: requer "name" e "examples[]".`);
    }
    for (const [i, ex] of m.examples.entries()) {
      if (!ex.inputs || typeof ex.inputs !== 'object') {
        throw new Error(`${f} exemplo #${i}: campo "inputs" ausente/inválido.`);
      }
    }
    return { file: f, ...m };
  });
}

async function findDataset(name) {
  const list = await api(`/datasets?name=${encodeURIComponent(name)}`);
  const arr = Array.isArray(list) ? list : list?.datasets || [];
  return arr.find((d) => d.name === name) || null;
}

async function ensureDataset(m) {
  let ds = await findDataset(m.name);
  if (ds && REPLACE) {
    console.log(`  ↻ --replace: apagando dataset existente ${m.name}`);
    await api(`/datasets/${ds.id}`, { method: 'DELETE' });
    ds = null;
  }
  if (!ds) {
    ds = await api('/datasets', {
      method: 'POST',
      body: JSON.stringify({
        name: m.name,
        description: m.description || '',
        data_type: m.data_type || 'kv',
      }),
    });
    console.log(`  ＋ dataset criado: ${m.name} (${ds.id})`);
  } else {
    console.log(`  = dataset já existe: ${m.name} (${ds.id})`);
  }
  return ds;
}

async function uploadExamples(datasetId, examples) {
  const payload = examples.map((ex) => ({
    dataset_id: datasetId,
    inputs: ex.inputs,
    outputs: ex.outputs ?? {},
    metadata: ex.metadata ?? {},
  }));
  await api('/examples/bulk', { method: 'POST', body: JSON.stringify(payload) });
  console.log(`  ↑ ${payload.length} exemplos enviados.`);
}

async function main() {
  const manifests = loadManifests().filter((m) => !ONLY || m.name.toLowerCase().includes(String(ONLY).toLowerCase()));
  console.log(`LangSmith @ ${ENDPOINT}`);
  console.log(`${manifests.length} dataset(s)${DRY_RUN ? ' [DRY-RUN]' : ''}\n`);

  for (const m of manifests) {
    console.log(`• ${m.name}  (${m.examples.length} exemplos, tipo=${m.data_type || 'kv'})`);
    if (DRY_RUN) continue;
    const ds = await ensureDataset(m);
    await uploadExamples(ds.id, m.examples);
  }
  console.log('\n✔ Concluído.');
}

main().catch((err) => {
  console.error(`\n✖ Falha: ${err.message}`);
  process.exit(1);
});
