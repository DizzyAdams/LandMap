/**
 * Leilão — imóveis em leilão em tempo real.
 *
 * Agrega leilões judiciais (SF → leilão.landmap.dev é o adaptador
 * oficial que raspa TRF/Caixa/estados) + leilão da Caixa. Sem adaptador
 * configurado (`LEILAO_BASE_URL`) o client roda em **mock mode** com lotes
 * sintéticos determinísticos. Para simular "tempo real", a cada ciclo de 15s
 * um subconjunto de lotes é sinalizado como `novo`.
 */
import type { LeilaoConfig, LeilaoLot } from './types.js';

const DEFAULT_BASE_URL = 'https://leilao.landmap.dev/v1';

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

const COMARCAS = [
  'São Paulo/SP', 'Rio de Janeiro/RJ', 'Belo Horizonte/MG',
  'Curitiba/PR', 'Porto Alegre/RS', 'Recife/PE', 'Salvador/BA', 'Brasília/DF',
];
const UFS = ['SP', 'RJ', 'MG', 'PR', 'RS', 'PE', 'BA', 'DF'];
const TIPOS: LeilaoLot['tipo'][] = ['judicial', 'caixa', 'precomposicao'];
const STATUS: LeilaoLot['status'][] = ['aberto', 'andamento', 'adjudicado', 'suspenso'];
const BENS = [
  'Apartamento 2 quartos, 68m²', 'Casa térrea, 3 quartos, 220m²',
  'Terreno 500m², zona sul', 'Sala comercial 45m²', 'Galpão logístico 1.200m²',
  'Loja em shopping, mezanino', 'Cobertura duplex 180m²', 'Chácara 2.000m²',
];

function mockLots(seed: string, limit: number): LeilaoLot[] {
  const out: LeilaoLot[] = [];
  for (let i = 0; i < limit; i++) {
    const r = hash(`${seed}:${i}`);
    const r2 = hash(`${seed}:${i}:b`);
    const aval = Math.round(120000 + r * 3800000);
    const idx = i % COMARCAS.length;
    out.push({
      id: `lot-${Math.floor(r * 1e9).toString(36)}`,
      tipo: TIPOS[i % TIPOS.length],
      comarca: COMARCAS[idx],
      uf: UFS[idx],
      bem: BENS[i % BENS.length],
      avaliacao: aval,
      lanceMinimo: Math.round(aval * (0.4 + r2 * 0.3)),
      abertura: new Date(Date.now() - Math.floor(r * 20) * 86400000).toISOString(),
      encerramento: new Date(Date.now() + (1 + Math.floor(r2 * 30)) * 86400000).toISOString(),
      status: STATUS[i % STATUS.length],
      novo: false,
      link: `https://leilao.landmap.dev/lote/${i}`,
      fonte: 'Leilão (mock)',
    });
  }
  return out;
}

export class LeilaoClient {
  private readonly baseUrl: string;

  constructor(config: LeilaoConfig = {}) {
    this.baseUrl =
      (config.baseUrl ?? process.env.LEILAO_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');
  }

  get configured(): boolean {
    return Boolean(process.env.LEILAO_BASE_URL);
  }

  get mock(): boolean {
    return !this.configured;
  }

  async listLots(opts: {
    estado?: string;
    tipo?: string;
    onlyLive?: boolean;
    limit?: number;
  } = {}): Promise<LeilaoLot[]> {
    if (!this.configured) {
      const cycle = Math.floor(Date.now() / 15000);
      const limit = opts.limit ?? 10;
      return mockLots(`leilao:${opts.estado ?? 'BR'}`, limit)
        .filter((l) => !opts.estado || l.uf === opts.estado)
        .filter((l) => !opts.tipo || l.tipo === opts.tipo)
        .map((l, i) => ({ ...l, novo: (cycle + i) % 3 === 0 }))
        .slice(0, limit);
    }

    const params = new URLSearchParams();
    if (opts.estado) params.set('uf', opts.estado);
    if (opts.tipo) params.set('tipo', opts.tipo);
    if (opts.onlyLive) params.set('onlyLive', '1');
    const res = await fetch(`${this.baseUrl}/lotes?${params.toString()}`);
    if (!res.ok) throw new Error(`Leilão API error ${res.status}`);
    return (await res.json()) as LeilaoLot[];
  }
}
