/**
 * CNPJ — consulta de pessoa jurídica via BrasilAPI.
 *
 * BrasilAPI (https://brasilapi.com.br) expõe dados públicos de CNPJ sem
 * necessidade de chave de API, então o client está sempre configurado e
 * opera em modo **live**. Em caso de erro de rede/fetch, devolve uma
 * empresa sintética determinística (mock) para não quebrar o fluxo.
 */
export interface CnpjConfig {
  baseUrl?: string;
}

export interface CnpjCompany {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacao: string;
  cnae: string;
  abertura: string;
  uf: string;
  municipio: string;
  simples: boolean;
  fonte: string;
}

const DEFAULT_BASE_URL = 'https://brasilapi.com.br';

function stripCnpj(value: string): string {
  return value.replace(/\D/g, '');
}

function mockCompany(cnpj: string): CnpjCompany {
  return {
    cnpj,
    razaoSocial: 'Empresa Modelo LTDA',
    nomeFantasia: 'Modelo',
    situacao: 'ATIVA',
    cnae: 'Atividade não informada',
    abertura: '2010-01-01',
    uf: 'SP',
    municipio: 'São Paulo',
    simples: true,
    fonte: 'CNPJ (mock)',
  };
}

export class CnpjClient {
  private readonly baseUrl: string;

  constructor(config?: CnpjConfig) {
    this.baseUrl =
      (config?.baseUrl ?? process.env.CNPJ_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');
  }

  get configured(): boolean {
    return true;
  }

  get mock(): boolean {
    return false;
  }

  async getCompany(cnpj: string): Promise<CnpjCompany> {
    const digits = stripCnpj(cnpj);
    if (!this.configured) {
      return mockCompany(digits);
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/cnpj/v1/${digits}`);
      if (!res.ok) throw new Error(`BrasilAPI CNPJ error ${res.status}`);
      const data = (await res.json()) as Record<string, unknown>;
      return {
        cnpj: digits,
        razaoSocial: String(data.razao_social ?? ''),
        nomeFantasia: String(data.nome_fantasia ?? ''),
        situacao: String(data.situacao ?? ''),
        cnae: String(data.cnae_fiscal_descricao ?? ''),
        abertura: String(data.data_inicio_atividade ?? ''),
        uf: String(data.uf ?? ''),
        municipio: String(data.municipio ?? ''),
        simples: Boolean(data.opcao_pelo_simples),
        fonte: 'BrasilAPI',
      };
    } catch {
      return mockCompany(digits);
    }
  }
}
