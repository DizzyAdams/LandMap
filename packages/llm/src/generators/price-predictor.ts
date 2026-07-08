/**
 * SimplePricePredictor — calcula preço estimado baseado em média
 * por metro quadrado de imóveis similares (mesma cidade, tipo).
 */

export interface TrainingProperty {
  id: string;
  city: string;
  state: string;
  type: string;
  price: number;
  areaM2: number;
  bedrooms?: number;
  modality?: string;
}

export interface PredictionInput {
  city: string;
  state: string;
  type: string;
  areaM2: number;
  bedrooms?: number;
  modality?: string;
}

export interface PredictionResult {
  estimatedPrice: number;
  estimatedPriceFormatted: string;
  priceM2: number;
  confidence: 'high' | 'medium' | 'low';
  sampleCount: number;
}

export class SimplePricePredictor {
  private properties: TrainingProperty[] = [];

  /**
   * train — alimenta o preditor com dados históricos de imóveis.
   */
  train(properties: TrainingProperty[]): void {
    this.properties = [...properties];
  }

  /**
   * predict — calcula preço estimado para um novo imóvel.
   */
  predict(input: PredictionInput): PredictionResult {
    const { city, state, type } = input;

    // Filter by same city and type
    const similar = this.properties.filter(
      (p) =>
        p.city.toLowerCase() === city.toLowerCase() &&
        p.state.toLowerCase() === state.toLowerCase() &&
        p.type === type &&
        p.areaM2 > 0,
    );

    const sampleCount = similar.length;

    if (sampleCount === 0) {
      // Fallback: same state + type only
      const stateSame = this.properties.filter(
        (p) =>
          p.state.toLowerCase() === state.toLowerCase() &&
          p.type === type &&
          p.areaM2 > 0,
      );

      const avgPriceM2 = stateSame.length > 0
        ? stateSame.reduce((sum, p) => sum + p.price / p.areaM2, 0) / stateSame.length
        : 5000; // national fallback estimate

      const estimated = Math.round(avgPriceM2 * input.areaM2);
      return {
        estimatedPrice: estimated,
        estimatedPriceFormatted: formatBRL(estimated),
        priceM2: Math.round(avgPriceM2),
        confidence: 'low',
        sampleCount: stateSame.length,
      };
    }

    const avgPriceM2 = similar.reduce((sum, p) => sum + p.price / p.areaM2, 0) / sampleCount;
    const estimated = Math.round(avgPriceM2 * input.areaM2);

    const confidence = sampleCount >= 10 ? 'high' : sampleCount >= 3 ? 'medium' : 'low';

    return {
      estimatedPrice: estimated,
      estimatedPriceFormatted: formatBRL(estimated),
      priceM2: Math.round(avgPriceM2),
      confidence,
      sampleCount,
    };
  }
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}
