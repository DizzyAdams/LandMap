/**
 * ViaCEP — public Brazilian CEP (postal code) lookup.
 *
 * Free, no API key required, so it always runs in **live mode**. This is a
 * core real-estate data source: turn a CEP into a full address (street,
 * neighborhood, city, UF, IBGE/DDD codes) to enrich property records.
 */
import type { ViaCepConfig, ViaCepAddress } from './types.js';

const DEFAULT_BASE_URL = 'https://viacep.com.br/ws';

export class ViaCepClient {
  private readonly baseUrl: string;

  constructor(config: ViaCepConfig = {}) {
    this.baseUrl = (config.baseUrl ?? process.env.VIACEP_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');
  }

  get configured(): boolean {
    return true;
  }

  get mock(): boolean {
    return false;
  }

  async lookup(cep: string): Promise<ViaCepAddress> {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) throw new Error('CEP inválido (use 8 dígitos)');

    const res = await fetch(`${this.baseUrl}/${clean}/json/`);
    if (!res.ok) throw new Error(`ViaCEP error ${res.status}`);
    const json = (await res.json()) as Partial<ViaCepAddress> & { erro?: boolean };
    if (json.erro) throw new Error('CEP não encontrado');
    return json as ViaCepAddress;
  }
}
