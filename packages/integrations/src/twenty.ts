/**
 * Twenty CRM — cliente fino para o hub de integrações.
 *
 * Reaproveita o `@landmap/twenty` como fonte de verdade do CRM; aqui só
 * expomos o status de saúde (configured quando `TWENTY_BASE_URL`
 * está presente). Mock mode quando não há instância configurada.
 */
import type { TwentyConfig } from './types.js';

export interface TwentyStatus {
  configured: boolean;
  mock: boolean;
  mode: 'live' | 'mock';
  version?: string;
}

export class TwentyClient {
  private readonly baseUrl?: string;

  constructor(config: TwentyConfig = {}) {
    this.baseUrl = config.baseUrl ?? process.env.TWENTY_BASE_URL;
  }

  get configured(): boolean {
    return Boolean(this.baseUrl);
  }

  get mock(): boolean {
    return !this.configured;
  }

  async getStatus(): Promise<TwentyStatus> {
    if (!this.configured) {
      return { configured: false, mock: true, mode: 'mock' };
    }
    try {
      const res = await fetch(`${this.baseUrl}/rest/metadata`);
      if (!res.ok) throw new Error(`Twenty ${res.status}`);
      const json = (await res.json()) as { version?: string };
      return { configured: true, mock: false, mode: 'live', version: json.version };
    } catch (e) {
      return {
        configured: true,
        mock: false,
        mode: 'live',
        version: String((e as Error).message),
      };
    }
  }
}
