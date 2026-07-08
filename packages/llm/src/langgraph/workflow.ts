import { StateGraph, END, START } from '@langchain/langgraph';
import { Annotation } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { tokenize } from '../rag.js';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'openai/gpt-4o-mini';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type PropertyRecord = {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  type?: string;
  modality?: string;
  description?: string;
};

export type GraphInput = {
  query: string;
  properties: PropertyRecord[];
};

export type GraphOutput = {
  answer: string;
  matches: Array<{ id: string; score: number; reason: string }>;
};

/* ------------------------------------------------------------------ */
/*  Graph state                                                        */
/* ------------------------------------------------------------------ */

const PropertyMatchingState = Annotation.Root({
  query: Annotation<string>({
    reducer: (_, next) => next,
  }),
  properties: Annotation<PropertyRecord[]>({
    reducer: (_, next) => next,
  }),
  intent: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),
  candidates: Annotation<PropertyRecord[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  scored: Annotation<Array<{ id: string; score: number; reason: string }>>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  answer: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),
});

/* ------------------------------------------------------------------ */
/*  Node functions                                                     */
/* ------------------------------------------------------------------ */

async function analyzeIntentNode(
  state: typeof PropertyMatchingState.State,
): Promise<Partial<typeof PropertyMatchingState.State>> {
  const apiKey = process.env.LANDMAP_LLM_KEY;
  if (!apiKey) throw new Error('LANDMAP_LLM_KEY env var not set');

  const model = new ChatOpenAI({
    model: DEFAULT_MODEL,
    configuration: { baseURL: OPENROUTER_BASE_URL },
    apiKey,
  });

  const systemPrompt = `You are an intent analyzer for a real-estate portal. Given a user query, classify the intent.

Respond with a single word: "search" if the user is looking for properties, "filter" if just browsing/filtering, or "general" otherwise.`;

  const response = await model.invoke([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: state.query },
  ]);

  const intent =
    response.content.toString().toLowerCase().includes('search')
      ? 'search'
      : response.content.toString().toLowerCase().includes('filter')
        ? 'filter'
        : 'general';

  return { intent };
}

async function retrievePropertiesNode(
  state: typeof PropertyMatchingState.State,
): Promise<Partial<typeof PropertyMatchingState.State>> {
  const query = state.query.toLowerCase();
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0) {
    return { candidates: state.properties.slice(0, 5) };
  }

  // TF-IDF scoring against property descriptions
  const tf = (tokens: string[]) => {
    const freq: Record<string, number> = {};
    for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
    const len = tokens.length || 1;
    return Object.fromEntries(
      Object.entries(freq).map(([k, v]) => [k, v / len]),
    ) as Record<string, number>;
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

  const qVec = tf(queryTokens);

  const scored = state.properties.map((p) => {
    const text = `${p.title} ${p.city} ${p.state} ${p.type ?? ''} ${p.modality ?? ''} ${p.description ?? ''}`;
    const pTokens = tokenize(text);
    const pVec = tf(pTokens);
    return { property: p, score: cosine(qVec, pVec) };
  });

  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((s) => s.property);

  return { candidates: top };
}

async function scoreCandidatesNode(
  state: typeof PropertyMatchingState.State,
): Promise<Partial<typeof PropertyMatchingState.State>> {
  const query = state.query.toLowerCase();
  const queryTokens = tokenize(query);
  const qVec = (() => {
    const freq: Record<string, number> = {};
    for (const t of queryTokens) freq[t] = (freq[t] || 0) + 1;
    const len = queryTokens.length || 1;
    return Object.fromEntries(
      Object.entries(freq).map(([k, v]) => [k, v / len]),
    ) as Record<string, number>;
  })();

  const tf = (tokens: string[]) => {
    const freq: Record<string, number> = {};
    for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
    const len = tokens.length || 1;
    return Object.fromEntries(
      Object.entries(freq).map(([k, v]) => [k, v / len]),
    ) as Record<string, number>;
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

  const scored = state.candidates.map((p) => {
    const text = `${p.title} ${p.city} ${p.state} ${p.type ?? ''} ${p.modality ?? ''} ${p.description ?? ''}`;
    const pTokens = tokenize(text);
    const pVec = tf(pTokens);
    const similarity = cosine(qVec, pVec);

    // Composite score: 60% semantic similarity + 40% price range heuristic
    let priceScore = 0.5;
    if (p.price > 0) {
      // Favour mid-range properties (less extreme prices get higher score)
      priceScore = Math.max(0, 1 - Math.log10(p.price / 500_000));
    }

    const composite = similarity * 0.6 + priceScore * 0.4;
    return {
      id: p.id,
      score: Math.round(composite * 100),
      reason: buildReason(p, similarity),
    };
  });

  return {
    scored: scored.sort((a, b) => b.score - a.score),
  };
}

async function generateResponseNode(
  state: typeof PropertyMatchingState.State,
): Promise<Partial<typeof PropertyMatchingState.State>> {
  const apiKey = process.env.LANDMAP_LLM_KEY;
  if (!apiKey) throw new Error('LANDMAP_LLM_KEY env var not set');

  const model = new ChatOpenAI({
    model: DEFAULT_MODEL,
    configuration: { baseURL: OPENROUTER_BASE_URL },
    apiKey,
  });

  const topMatches = state.scored.slice(0, 3);
  const context = topMatches
    .map(
      (m, i) =>
        `${i + 1}. Property ${m.id} (score: ${m.score}/100) — ${m.reason}`,
    )
    .join('\n');

  const systemPrompt =
    `You are a real-estate recommendation assistant. Based on the user query and the scored property matches, provide a friendly recommendation.

Query: ${state.query}

Top matches:
${context || 'No relevant matches found.'}

Provide a concise recommendation (2–3 sentences).`;

  const response = await model.invoke([
    { role: 'system', content: systemPrompt },
  ]);

  return { answer: response.content.toString() };
}

/* ---- helper ---- */

function buildReason(property: PropertyRecord, similarity: number): string {
  const parts: string[] = [];
  if (similarity > 0.3) parts.push('semantic match with query');
  if (property.price > 0) parts.push(`price R$ ${property.price.toLocaleString('pt-BR')}`);
  if (property.type) parts.push(`type: ${property.type}`);
  if (property.city) parts.push(`located in ${property.city}/${property.state}`);
  return parts.join(', ') || 'available property';
}

/* ------------------------------------------------------------------ */
/*  Build graph                                                        */
/* ------------------------------------------------------------------ */

const workflow = new StateGraph(PropertyMatchingState)
  .addNode('analyzeIntent', analyzeIntentNode)
  .addNode('retrieveProperties', retrievePropertiesNode)
  .addNode('scoreCandidates', scoreCandidatesNode)
  .addNode('generateResponse', generateResponseNode)

  .addEdge(START, 'analyzeIntent')
  .addEdge('analyzeIntent', 'retrieveProperties')
  .addEdge('retrieveProperties', 'scoreCandidates')
  .addEdge('scoreCandidates', 'generateResponse')
  .addEdge('generateResponse', END);

export const propertyMatchingGraph = workflow.compile();

/* ------------------------------------------------------------------ */
/*  Convenience runner                                                 */
/* ------------------------------------------------------------------ */

/**
 * Run the full property-matching workflow and return the final state.
 */
export async function runPropertyMatchingGraph(
  input: GraphInput,
): Promise<GraphOutput> {
  const result = await propertyMatchingGraph.invoke(input);
  return {
    answer: result.answer,
    matches: result.scored,
  };
}
