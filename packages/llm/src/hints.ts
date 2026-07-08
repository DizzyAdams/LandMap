import type { TextChunk } from './types.js';
import { retrieve } from './rag.js';

const toChunk = (item: TextChunk) => ({
  id: item.id,
  path: item.id,
  title: item.metadata.title ?? item.id,
  text: item.text,
  tokens: item.text.split(/\s+/).filter(Boolean).length,
});

export function buildMarkdownChunks(markdowns: Array<{ id: string; content: string; metadata?: Record<string, string> }>): TextChunk[] {
  return markdowns.map((item) => {
    const text = item.content ?? '';
    const [, ...rest] = text.split('\n');
    const body = rest.join('\n').trim() || text;

    return {
      id: item.id,
      text: body,
      metadata: {
        title: item.id,
        ...(item.metadata ?? {}),
      },
    };
  });
}

export function searchLocalRag(
  query: string,
  chunks: TextChunk[],
  limit = 3,
) {
  return retrieve(query, chunks.map(toChunk), limit);
}
