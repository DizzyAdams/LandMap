import { Hono } from 'hono';

type Suggestion = {
  text: string;
  category: 'city' | 'neighborhood' | 'type' | 'modality';
};

const SUGGESTIONS: Suggestion[] = [
  { text: 'Curitiba', category: 'city' },
  { text: 'Florianópolis', category: 'city' },
  { text: 'Balneário Camboriú', category: 'city' },
  { text: 'São Paulo', category: 'city' },
  { text: 'Rio de Janeiro', category: 'city' },
  { text: 'Belo Horizonte', category: 'city' },
  { text: 'Porto Alegre', category: 'city' },
  { text: 'Brasília', category: 'city' },
  { text: 'Centro', category: 'neighborhood' },
  { text: 'Batel', category: 'neighborhood' },
  { text: 'Trindade', category: 'neighborhood' },
  { text: 'Centro Cívico', category: 'neighborhood' },
  { text: 'Orla', category: 'neighborhood' },
  { text: 'Apartamento', category: 'type' },
  { text: 'Casa', category: 'type' },
  { text: 'Terreno', category: 'type' },
  { text: 'Comercial', category: 'type' },
  { text: 'Venda', category: 'modality' },
  { text: 'Aluguel', category: 'modality' },
  { text: 'Lançamento', category: 'modality' },
];

export function createSearchSuggestionsRouter() {
  const router = new Hono();

  router.get('/suggestions', async (c) => {
    const q = (c.req.query('q') || '').trim().toLowerCase();

    if (!q || q.length < 1) {
      return c.json({ items: [], total: 0 });
    }

    const filtered = SUGGESTIONS.filter((s) =>
      s.text.toLowerCase().includes(q)
    );

    return c.json({ items: filtered, total: filtered.length });
  });

  return router;
}
