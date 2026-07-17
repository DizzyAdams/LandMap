import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

export type Chunk = {
  id: string;
  path: string;
  title: string;
  text: string;
  tokens: number;
};

/** Cap markdowns corpus so TF-IDF stays interactive (3000 files is too heavy cold). */
const MAX_MARKDOWN_FILES = Number(process.env.LANDMAP_RAG_MAX_DOCS || 120);

const STOP = new Set([
  'de',
  'do',
  'da',
  'dos',
  'das',
  'em',
  'para',
  'com',
  'por',
  'um',
  'uma',
  'uns',
  'umas',
  'no',
  'na',
  'nos',
  'nas',
  'ao',
  'aos',
  'à',
  'às',
  'e',
  'ou',
  'que',
  'se',
  'nao',
  'não',
  'é',
  'como',
  'mais',
  'menos',
  'tem',
  'entre',
]);

/** Resolve monorepo data dirs from common API cwd locations. */
export function resolveDataDirs(): string[] {
  const cwd = process.cwd();
  const candidates = [
    join(cwd, 'data', 'landmap'),
    join(cwd, 'data', 'markdowns'),
    join(cwd, '..', '..', 'data', 'landmap'),
    join(cwd, '..', '..', 'data', 'markdowns'),
    join(cwd, '..', 'data', 'landmap'),
    join(cwd, '..', 'data', 'markdowns'),
    resolve(cwd, '../../data/landmap'),
    resolve(cwd, '../../data/markdowns'),
  ];
  const found: string[] = [];
  for (const d of candidates) {
    if (existsSync(d) && !found.includes(d)) found.push(d);
  }
  return found;
}

export function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-zà-ÿ0-9]+/gi, ' ')
    .split(' ')
    .filter((w) => w.length > 1 && !STOP.has(w));
}

export function chunkText(input: { path: string; title: string; text: string }) {
  const words = input.text.split(/\s+/);
  const window = 220;
  const overlap = 60;
  const chunks: Chunk[] = [];
  let i = 0;
  while (i < words.length) {
    const slice = words.slice(i, i + window).join(' ');
    chunks.push({
      id: `${input.path.replace(/[^a-z0-9\-/]/gi, '_')}_chunk_${chunks.length}`,
      path: input.path,
      title: input.title,
      text: slice,
      tokens: slice.split(/\s+/).length,
    });
    if (i + window >= words.length) break;
    i += window - overlap;
  }
  return chunks;
}

function readDoc(file: string) {
  const text = readFileSync(file, 'utf-8');
  const title = text.match(/^#\s+(.+)$/m)?.[1] || file;
  return chunkText({ path: file, title, text });
}

/** Built-in product knowledge when no markdowns are on disk (tests / sparse deploys). */
function builtInChunks(): Chunk[] {
  const docs = [
    {
      path: 'builtin://score-landmap',
      title: 'Score LandMap — metodologia',
      text:
        'O Score LandMap (0–100) combina valorização de m², infraestrutura urbana, velocidade de crescimento, ' +
        'segurança, liquidez e risco ambiental. Bandas: Crítico <40, Moderado 40–60, Bom 60–75, Excelente 75–90, Excepcional 90+. ' +
        'Usado no mapa intelligence, rankings e recomendações.',
    },
    {
      path: 'builtin://heatmap',
      title: 'Heatmap de preço',
      text:
        'O heatmap normaliza preço médio por m² por bairro em escala 0–1. Camadas: valorização, infra, segurança, densidade, ' +
        'IDH, mobilidade, liquidez e zoneamento. Fonte: market/heatmap + mapIntelligence.',
    },
    {
      path: 'builtin://webhooks',
      title: 'Webhooks LandMap',
      text:
        'Webhooks outbound enviam eventos property.*, lead.*, alert.fired, rag.query, score.updated e ping. ' +
        'Assinatura HMAC-SHA256 no header X-LandMap-Signature. Gerencie em /admin/webhooks e API /webhooks/endpoints.',
    },
    {
      path: 'builtin://rag',
      title: 'RAG LandMap',
      text:
        'Retrieval local TF-IDF sobre dossiês markdown e docs de produto. POST /rag/query retorna answer + sources. ' +
        'UI em /rag e chat. LLM opcional via LANDMAP_LLM_KEY; sem chave usa modo demo.',
    },
    {
      path: 'builtin://fortaleza',
      title: 'Inteligência territorial Fortaleza',
      text:
        'Regiões demo: Meireles, Aldeota, Cocó, Papicu, Centro. Camadas de valorização 12m, obras, risco de enchente e Score. ' +
        'Mapa em /map (Map Intelligence).',
    },
  ];
  return docs.flatMap((d) => chunkText(d));
}

export function ingestDocuments() {
  const dirs = resolveDataDirs();
  const chunks: Chunk[] = [...builtInChunks()];

  for (const dir of dirs) {
    const isMarkdowns = dir.replace(/\\/g, '/').includes('/markdowns');
    let files = readdirSync(dir).filter((file) => file.endsWith('.md'));
    if (isMarkdowns) {
      files = files.sort().slice(0, MAX_MARKDOWN_FILES);
    }
    for (const file of files) {
      try {
        chunks.push(...readDoc(join(dir, file)));
      } catch {
        // skip unreadable
      }
    }
  }

  return chunks;
}

const tf = (tokens: string[]) => {
  const freq: Record<string, number> = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  const len = tokens.length || 1;
  return Object.fromEntries(Object.entries(freq).map(([k, v]) => [k, v / len])) as Record<string, number>;
};

const cosine = (a: Record<string, number>, b: Record<string, number>) => {
  let ab = 0;
  let aa = 0;
  let bb = 0;
  for (const k of Object.keys(a)) {
    if (b[k]) ab += a[k] * b[k];
    aa += a[k] * a[k];
    bb += (b[k] || 0) * (b[k] || 0);
  }
  return aa && bb ? ab / (Math.sqrt(aa) * Math.sqrt(bb)) : 0;
};

export type RetrievalResult = {
  chunk: Chunk;
  score: number;
};

export function retrieve(query: string, chunks: Chunk[], top = 3) {
  const qtokens = tokenize(query);
  const qv = tf(qtokens);
  const ranked: RetrievalResult[] = chunks.map((chunk) => ({
    chunk,
    score: cosine(qv, tf(tokenize(chunk.text))),
  }));
  return ranked.sort((a, b) => b.score - a.score).slice(0, top);
}

let CACHE: Chunk[] | null = null;

export function inMemoryIndex() {
  if (!CACHE) CACHE = ingestDocuments();
  return CACHE;
}

export function resetRagCache() {
  CACHE = null;
}

export function ragIndexStats() {
  const chunks = inMemoryIndex();
  const paths = new Set(chunks.map((c) => c.path));
  return {
    chunks: chunks.length,
    documents: paths.size,
    dirs: resolveDataDirs(),
  };
}
