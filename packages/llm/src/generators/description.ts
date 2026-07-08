import { chatCompletion } from '../completion.js';

export interface PropertyForDescription {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  areaM2: number;
  bedrooms?: number;
  type: string;
  modality: string;
  neighborhood?: string;
  zone?: string;
  tags?: string[];
}

/**
 * generatePropertyDescription — uses chatCompletion (OpenRouter) to generate
 * a creative, human-readable property description in Brazilian Portuguese.
 */
export async function generatePropertyDescription(
  property: PropertyForDescription,
): Promise<string> {
  const priceFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(property.price);

  const tags = property.tags?.length ? property.tags.join(', ') : '—';
  const location = [property.neighborhood, property.zone, property.city, property.state]
    .filter(Boolean)
    .join(', ');

  const systemPrompt = `Você é um copywriter especializado em imóveis brasileiros. Gere uma descrição criativa, persuasiva e profissional em português do Brasil para o imóvel descrito abaixo.

A descrição deve:
- Ter entre 80 e 200 palavras
- Destacar os pontos fortes do imóvel (localização, tamanho, potencial)
- Usar tom profissional e acolhedor
- Ser adequada para site de anúncio imobiliário
- Incluir um parágrafo curto sobre o bairro/região quando possível
- Terminar com um chamado à ação sutil

Responda apenas com o texto da descrição, sem formatação markdown, sem cabeçalhos.`;

  const userPrompt = `Título: ${property.title}
Tipo: ${property.type}
Modalidade: ${property.modality}
Localização: ${location}
Área: ${property.areaM2}m²
Preço: ${priceFormatted}
${property.bedrooms ? `Quartos: ${property.bedrooms}` : ''}
Tags: ${tags}`;

  const { content } = await chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  return content.trim();
}
