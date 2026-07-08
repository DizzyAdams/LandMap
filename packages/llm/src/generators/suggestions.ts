import { chatCompletion } from '../completion.js';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface SearchSuggestion {
  type: 'correction' | 'expansion' | 'filter';
  text: string;
}

export interface SuggestionsResult {
  suggestions: SearchSuggestion[];
}

/* ------------------------------------------------------------------ */
/*  Generator                                                         */
/* ------------------------------------------------------------------ */

/**
 * generateSearchSuggestions — analisa uma consulta de busca do usuário
 * e retorna sugestões de busca (correção ortográfica, expansão,
 * ou filtros sugeridos).
 */
export async function generateSearchSuggestions(
  query: string,
  availableTypes: string[],
  availableCities: string[],
): Promise<SuggestionsResult> {
  if (!query.trim()) {
    return { suggestions: [] };
  }

  const types = availableTypes.join(', ');
  const cities = availableCities.join(', ');

  const { content } = await chatCompletion([
    {
      role: 'system',
      content: `Você é um assistente de busca imobiliária. Analise a consulta do usuário e sugira melhorias.

Tipos disponíveis: ${types}
Cidades disponíveis: ${cities}

Responda com JSON válido (sem markdown) com a chave:
- "suggestions": array de objetos { "type": "correction" | "expansion" | "filter", "text": string }

Regras:
- "correction": se a consulta tem erro de digitação óbvio, sugira a correção
- "expansion": sugira termos adicionais que o usuário pode querer incluir
- "filter": sugira filtros úteis (cidade, tipo, faixa de preço)
- Máximo 3 sugestões no total
- Se a consulta está boa, retorne array vazio []`,
    },
    { role: 'user', content: `Consulta do usuário: "${query}"` },
  ]);

  try {
    const parsed = JSON.parse(content) as SuggestionsResult;
    return parsed;
  } catch {
    return { suggestions: [] };
  }
}
