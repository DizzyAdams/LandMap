/**
 * Câmbio — cotações oficiais (BCB via AwesomeAPI), live e sem chave.
 *
 * Útil para o módulo de investimento/financiamento internacional da
 * plataforma (ex.: imóveis em dólar, ROI em BRL). Roda sempre em
 * **live mode**.
 */
import type { CambioConfig, CambioQuote } from './types.js';

const DEFAULT_BASE_URL = 'https://economia.awesomeapi.com.br';

export class CambioClient {
  private readonly baseUrl: string;

  constructor(config: CambioConfig = {}) {
    this.baseUrl =
      (config.baseUrl ?? process.env.CAMBIO_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');
  }

  get configured(): boolean {
    return true;
  }

  get mock(): boolean {
    return false;
  }

  async getQuote(pair = 'USD-BRL'): Promise<CambioQuote> {
    const key = pair.replace('-', '').toUpperCase();
    const res = await fetch(`${this.baseUrl}/json/last/${pair}`);
    if (!res.ok) throw new Error(`Câmbio API error ${res.status}`);
    const json = (await res.json()) as Record<string, {
      bid: string;
      ask: string;
      create_date: string;
      code: string;
    }>;
    const q = json[key] ?? json[Object.keys(json)[0]];
    return {
      pair,
      bid: Number(q.bid),
      ask: Number(q.ask),
      updatedAt: q.create_date,
    };
  }
}
