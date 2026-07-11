/**
 * IBGE — public Brazilian Institute of Geography and Statistics API.
 *
 * Free, no API key required, always **live mode**. Surfaces UF (states) and
 * municípios (cities) — the canonical geographic backbone for real-estate
 * market segmentation by state/city.
 */
import type { IbgeConfig, IbgeUf, IbgeCity } from './types.js';

const DEFAULT_BASE_URL = 'https://servicodados.ibge.gov.br/api/v1';

export class IbgeClient {
  private readonly baseUrl: string;

  constructor(config: IbgeConfig = {}) {
    this.baseUrl = (config.baseUrl ?? process.env.IBGE_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');
  }

  get configured(): boolean {
    return true;
  }

  get mock(): boolean {
    return false;
  }

  async listUf(): Promise<IbgeUf[]> {
    const res = await fetch(`${this.baseUrl}/localidades/estados`);
    if (!res.ok) throw new Error(`IBGE error ${res.status}`);
    const json = (await res.json()) as Array<{ id: number; sigla: string; nome: string }>;
    return json.map((u) => ({ id: u.id, sigla: u.sigla, nome: u.nome }));
  }

  async listCities(uf: string): Promise<IbgeCity[]> {
    const res = await fetch(`${this.baseUrl}/localidades/estados/${uf.toUpperCase()}/municipios`);
    if (!res.ok) throw new Error(`IBGE error ${res.status}`);
    const json = (await res.json()) as Array<{ id: number; nome: string }>;
    return json.map((c) => ({ id: c.id, nome: c.nome }));
  }
}
