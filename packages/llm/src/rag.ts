import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

export type Chunk = {
  id: string;
  path: string;
  title: string;
  text: string;
  tokens: number;
};

const ROOT = join(process.cwd(), '..', '..');
const DATA_DIR = join(ROOT, 'data', 'landmap');

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

export function ingestDocuments() {
  if (!existsSync(DATA_DIR)) return [] as Chunk[];
  const chunks: Chunk[] = [];
  const files = readdirSync(DATA_DIR).filter((file) => file.endsWith('.md'));
  for (const file of files) chunks.push(...readDoc(join(DATA_DIR, file)));
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
  const ranked: RetrievalResult[] = chunks.map((chunk) => ({ chunk, score: cosine(qv, tf(tokenize(chunk.text))) }));
  return ranked.sort((a, b) => b.score - a.score).slice(0, top);
}

let CACHE: Chunk[] | null = null;
export function inMemoryIndex() {
  if (!CACHE) CACHE = ingestDocuments();
  return CACHE;
}
