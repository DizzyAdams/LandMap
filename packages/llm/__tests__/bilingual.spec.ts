import { describe, it, expect } from 'vitest';
import { detectLanguage, bilingualChunk, MixedLanguageIndex } from '../src/bilingual';

describe('llm/bilingual', () => {
  it('detects Portuguese text', () => {
    expect(detectLanguage('Compre um apartamento à venda no Rio de Janeiro')).toBe('pt-BR');
  });

  it('detects English text', () => {
    expect(detectLanguage('Buy a beautiful house for sale in Miami')).toBe('en-US');
  });

  it('detects Spanish text', () => {
    expect(detectLanguage('Casa en venta con piscina en Madrid')).toBe('es-ES');
  });

  it('splits text into sentence-boundary chunks with language tag', () => {
    const text = 'Primeira frase sobre imóveis. Segunda frase com mais detalhes sobre a venda. Terceira frase curta.';
    const chunks = bilingualChunk(text, { maxWords: 6 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.lang === 'pt-BR')).toBe(true);
    expect(chunks[0].index).toBe(0);
  });

  it('retrieves across languages via shared vocabulary', () => {
    const index = new MixedLanguageIndex();
    index.add([
      { id: 'a', text: 'Apartamento à venda em São Paulo com 2 quartos' },
      { id: 'b', text: 'House for sale in Miami with a swimming pool' },
      { id: 'c', text: 'Casa en venta en Madrid con piscina' },
    ]);
    const results = index.search('apartamento venda', 2);
    expect(results[0].doc.id).toBe('a');
  });
});
