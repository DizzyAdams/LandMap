/**
 * Bacen — Banco Central do Brasil (SGS, séries temporais, sem chave).
 *
 * Cliente para o Sistema Gerenciador de Séries Temporais (SGS) do Banco
 * Central. A API pública (`api.bcb.gov.br/dados/serie/...`) é **keyless**,
 * então o client está sempre `configured` e nunca roda em mock mode. Em
 * caso de falha de rede/resposta, devolve um `BacenDado` sintético
 * determinístico por série.
 */

export interface BacenConfig {
  baseUrl?: string;
}

export interface BacenDado {
  data: string;
  valor: number;
}

const DEFAULT_BASE_URL = 'https://api.bcb.gov.br';

// Valores de referência determinísticos por série (Selic=11, CDI=12, IPCA=433).
const REFERENCIA: Record<number, number> = { 11: 10.5, 12: 10.65, 433: 0.42 };

function syntheticDado(serie: number): BacenDado {
  const valor = REFERENCIA[serie] ?? (((serie % 100) + 1) * 0.1);
  return { data: '01/01/2000', valor };
}

export class BacenClient {
  private readonly baseUrl: string;

  constructor(config?: BacenConfig) {
    this.baseUrl =
      (config?.baseUrl ?? process.env.BACEN_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');
  }

  get configured(): boolean {
    return true;
  }

  get mock(): boolean {
    return false;
  }

  async getSerie(serie: number, ultimos = 10): Promise<BacenDado[]> {
    try {
      const res = await fetch(
        `${this.baseUrl}/dados/serie/bcdata.sgs.${serie}/dados/ultimos/${ultimos}?formato=json`,
      );
      if (!res.ok) throw new Error(`Bacen API error ${res.status}`);
      const raw = (await res.json()) as Array<{ data: string; valor: number | null }>;
      const validos = raw
        .filter((r) => r.valor !== null && r.valor !== undefined)
        .map((r) => ({ data: r.data, valor: Number(r.valor) }));
      if (validos.length === 0) return [syntheticDado(serie)];
      return validos;
    } catch {
      return [syntheticDado(serie)];
    }
  }

  async getSelic(ultimos = 10): Promise<BacenDado[]> {
    return this.getSerie(11, ultimos);
  }

  async getCdi(ultimos = 10): Promise<BacenDado[]> {
    return this.getSerie(12, ultimos);
  }

  async getIpca(ultimos = 10): Promise<BacenDado[]> {
    return this.getSerie(433, ultimos);
  }
}
