import { describe, it, expect } from 'vitest';
import { tokenize, chunkText, retrieve, type Chunk } from '../src/rag';

describe('llm/rag — tokenize', () => {
  it('lowercases, drops punctuation and stopwords', () => {
    const tokens = tokenize('Não quero comprar CASA em São Paulo!');
    expect(tokens).toContain('quero');
    expect(tokens).toContain('comprar');
    expect(tokens).toContain('casa');
    expect(tokens).toContain('são');
    expect(tokens).toContain('paulo');
    // stopwords removed
    expect(tokens).not.toContain('não');
    expect(tokens).not.toContain('em');
  });

  it('drops single-character tokens', () => {
    expect(tokenize('a b casa')).toEqual(['casa']);
  });
});

describe('llm/rag — chunkText', () => {
  it('returns a single chunk for short text with stable id/title/tokens', () => {
    const chunks = chunkText({ path: 'doc/a.md', title: 'Título', text: 'apartamento novo em curitiba' });
    expect(chunks).toHaveLength(1);
    expect(chunks[0].id).toBe('doc/a_md_chunk_0');
    expect(chunks[0].title).toBe('Título');
    expect(chunks[0].tokens).toBe(4);
  });

  it('splits long text into overlapping windows', () => {
    const words = Array.from({ length: 600 }, (_, i) => `w${i}`);
    const text = words.join(' ');
    const chunks = chunkText({ path: 'long.md', title: 'Longo', text });

    // window=220, overlap=60 -> ~4 chunks
    expect(chunks.length).toBeGreaterThan(2);
    expect(chunks.length).toBeLessThanOrEqual(5);

    // ids are unique and sequential
    const ids = chunks.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);

    // last words of chunk 0 overlap with first words of chunk 1
    const tail0 = chunks[0].text.split(' ').slice(-60).join(' ');
    expect(chunks[1].text).toContain(tail0.split(' ')[0]);
  });
});

describe('llm/rag — retrieve', () => {
  const corpus: Chunk[] = [
    chunkText({ path: 'apt.md', title: 'Apartamento', text: 'apartamento dois quartos venda são paulo capital' })[0],
    chunkText({ path: 'casa.md', title: 'Casa', text: 'casa de campo com piscina e jardim tranquilo' })[0],
    chunkText({ path: 'comercial.md', title: 'Comercial', text: 'sala comercial centro financiada para empresa' })[0],
  ];

  it('ranks the most relevant chunk first', () => {
    const results = retrieve('apartamento venda são paulo', corpus, 3);
    expect(results[0].chunk.path).toBe('apt.md');
    expect(results[0].score).toBeGreaterThan(0);
  });

  it('respects the top parameter', () => {
    const results = retrieve('imóvel', corpus, 1);
    expect(results).toHaveLength(1);
  });

  it('returns all chunks when top exceeds corpus size', () => {
    const results = retrieve('imóvel', corpus, 10);
    expect(results).toHaveLength(3);
  });
});
