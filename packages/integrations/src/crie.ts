/**
 * CRIE — Registro de Imóveis Eletrônico (ANOREG / IRRAD).
 *
 * The CRIE network exposes official property-registry records (matrículas,
 * cartórios, ônus) across Brazilian registry offices. There is no single
 * public Meta-style REST endpoint, so this client models the *capability*
 * (matrícula lookup, owner CPF/CNPJ search, property search) and runs in
 * **mock mode** with deterministic synthetic records until a real adapter
 * (e.g. a cartório/IRRAD gateway) is configured via `baseUrl` + `apiKey`.
 */
import type { CrieConfig, CrieRecord } from './types.js';

const DEFAULT_BASE_URL = 'https://api.crie.registro.org.br/v1';

/** Deterministic pseudo-random so mock records are stable per query. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

function maskCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '').padEnd(11, '0').slice(0, 11);
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9)}`;
}

function mockRecord(seed: string, label: string): CrieRecord {
  const r = hash(seed);
  const matricula = 100000 + Math.floor(r * 899999);
  const situacao: CrieRecord['situacao'] = r > 0.7 ? 'com_onus' : 'ativo';
  const onus = situacao === 'com_onus' ? (r > 0.85 ? 'penhora' : 'hipoteca') : 'nenhum';
  const cartorios = [
    '1º RGI de São Paulo',
    '2º RGI do Rio de Janeiro',
    'RGI de Belo Horizonte',
    'RGI de Curitiba',
    'RGI de Recife',
  ];
  return {
    matricula: String(matricula),
    cartorio: cartorios[Math.floor(r * cartorios.length)],
    comarca: label,
    proprietario: maskCpf(`${(Math.floor(r * 9) + 1)}${Math.floor(r * 1e9)}`),
    areaM2: Math.round(40 + r * 600),
    situacao,
    onus,
    dataRegistro: new Date(2015 + Math.floor(r * 9), Math.floor(r * 12), 1 + Math.floor(r * 27))
      .toISOString()
      .slice(0, 10),
    fonte: 'CRIE (mock)',
  };
}

export class CrieClient {
  private readonly apiKey?: string;
  private readonly baseUrl: string;

  constructor(config: CrieConfig = {}) {
    this.apiKey = config.apiKey ?? process.env.CRIE_API_KEY;
    this.baseUrl = (config.baseUrl ?? process.env.CRIE_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');
  }

  get configured(): boolean {
    return Boolean(this.apiKey);
  }

  get mock(): boolean {
    return !this.configured;
  }

  async lookupMatricula(matricula: string, cartorio?: string): Promise<CrieRecord> {
    if (!this.configured) return mockRecord(`mat:${matricula}:${cartorio ?? ''}`, cartorio ?? 'Brasil');
    const res = await fetch(
      `${this.baseUrl}/matriculas/${encodeURIComponent(matricula)}?cartorio=${encodeURIComponent(cartorio ?? '')}`,
      { headers: { Authorization: `Bearer ${this.apiKey}` } },
    );
    if (!res.ok) throw new Error(`CRIE API error ${res.status}`);
    return (await res.json()) as CrieRecord;
  }

  async lookupByCpf(cpf: string): Promise<CrieRecord[]> {
    if (!this.configured) {
      const r = hash(`cpf:${cpf}`);
      return [mockRecord(`cpf:${cpf}:a`, `Comarca ${(Math.floor(r * 26) + 1)}`), mockRecord(`cpf:${cpf}:b`, 'Capital')];
    }
    const res = await fetch(`${this.baseUrl}/proprietarios/${encodeURIComponent(cpf)}/imoveis`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw new Error(`CRIE API error ${res.status}`);
    return (await res.json()) as CrieRecord[];
  }

  async lookupImovel(cidade: string, estado: string, endereco?: string): Promise<CrieRecord[]> {
    if (!this.configured) {
      const seed = `imovel:${cidade}:${estado}:${endereco ?? ''}`;
      const r = hash(seed);
      const count = 1 + Math.floor(r * 3);
      return Array.from({ length: count }, (_, i) => mockRecord(`${seed}:${i}`, `${cidade}/${estado}`));
    }
    const params = new URLSearchParams({ cidade, estado, ...(endereco ? { endereco } : {}) });
    const res = await fetch(`${this.baseUrl}/imoveis?${params.toString()}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw new Error(`CRIE API error ${res.status}`);
    return (await res.json()) as CrieRecord[];
  }
}
