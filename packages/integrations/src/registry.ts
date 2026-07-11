import { OpenDesignClient } from './opendesign.js';
import { WhatsAppClient } from './whatsapp.js';
import { CrieClient } from './crie.js';
import { ViaCepClient } from './viacep.js';
import { IbgeClient } from './ibge.js';
import { LeilaoClient } from './leilao.js';
import { CambioClient } from './cambio.js';
import { TwentyClient } from './twenty.js';
import { CnpjClient } from './cnpj.js';
import { BacenClient } from './bacen.js';
import { GeoClient } from './geo.js';

export type IntegrationCategory = 'messaging' | 'registry' | 'design' | 'crm' | 'data';

export interface IntegrationMeta {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  docsUrl: string;
  configured: boolean;
  mock: boolean;
}

const OPENDESIGN_DOCS = 'https://www.opendesign.ai/';
const WHATSAPP_DOCS = 'https://developers.facebook.com/docs/whatsapp/cloud-api';
const CRIE_DOCS = 'https://www.anoreg.org.br/registro-eletronico/';

/**
 * Central, zero-credential registry of every external integration the
 * LandMap platform ships with. Each entry lazily instantiates its client
 * (reading env vars) to report live `configured` / `mock` state.
 */
export function listIntegrations(): IntegrationMeta[] {
  const opendesign = new OpenDesignClient();
  const whatsapp = new WhatsAppClient();
  const crie = new CrieClient();
  const viacep = new ViaCepClient();
  const ibge = new IbgeClient();
  const leilao = new LeilaoClient();
  const cambio = new CambioClient();
  const twenty = new TwentyClient();
  const cnpj = new CnpjClient();
  const bacen = new BacenClient();
  const geo = new GeoClient();

  return [
    {
      id: 'opendesign',
      name: 'OpenDesign',
      description: 'Feed de design assets (frames, componentes, tokens) para o Studio.',
      category: 'design',
      docsUrl: OPENDESIGN_DOCS,
      configured: opendesign.configured,
      mock: !opendesign.configured,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business (WABA)',
      description: 'Disparo de mensagens, templates e webhook de entrada via Cloud API.',
      category: 'messaging',
      docsUrl: WHATSAPP_DOCS,
      configured: whatsapp.configured,
      mock: !whatsapp.configured,
    },
    {
      id: 'crie',
      name: 'CRIE — Registro de Imóveis',
      description: 'Consulta de matrículas, cartórios e ônus (ANOREG/IRRAD).',
      category: 'registry',
      docsUrl: CRIE_DOCS,
      configured: crie.configured,
      mock: !crie.configured,
    },
    {
      id: 'viacep',
      name: 'ViaCEP',
      description: 'Consulta de CEP → logradouro, bairro, cidade e UF (público, sem chave).',
      category: 'data',
      docsUrl: 'https://viacep.com.br',
      configured: viacep.configured,
      mock: !viacep.configured,
    },
    {
      id: 'ibge',
      name: 'IBGE',
      description: 'Localidades oficiais: UF (estados) e municípios (público, sem chave).',
      category: 'data',
      docsUrl: 'https://servicodados.ibge.gov.br/api/docs',
      configured: ibge.configured,
      mock: !ibge.configured,
    },
    {
      id: 'leilao',
      name: 'Leilão (tempo real)',
      description: 'Imóveis em leilão judiciário + Caixa: lotes, avaliação e lance mínimo, ao vivo.',
      category: 'registry',
      docsUrl: 'https://leilao.landmap.dev',
      configured: leilao.configured,
      mock: !leilao.configured,
    },
    {
      id: 'cambio',
      name: 'Câmbio (BCB)',
      description: 'Cotações oficiais (USD/BRL etc.) via AwesomeAPI — live, sem chave.',
      category: 'data',
      docsUrl: 'https://economia.awesomeapi.com.br',
      configured: cambio.configured,
      mock: !cambio.configured,
    },
    {
      id: 'twenty',
      name: 'Twenty CRM',
      description: 'CRM de relacionamento (pessoas, negócios, oportunidades) do LandMap.',
      category: 'crm',
      docsUrl: 'https://github.com/twentyhq/twenty',
      configured: twenty.configured,
      mock: !twenty.configured,
    },
    {
      id: 'cnpj',
      name: 'CNPJ (Receita Federal)',
      description: 'Consulta de pessoa jurídica via BrasilAPI — live, sem chave.',
      category: 'data',
      docsUrl: 'https://brasilapi.com.br',
      configured: cnpj.configured,
      mock: !cnpj.configured,
    },
    {
      id: 'bacen',
      name: 'Banco Central (SGS)',
      description: 'Taxas oficiais Selic / CDI / IPCA (BCB) — live, sem chave.',
      category: 'data',
      docsUrl: 'https://api.bcb.gov.br',
      configured: bacen.configured,
      mock: !bacen.configured,
    },
    {
      id: 'geo',
      name: 'Geo (OpenStreetMap)',
      description: 'Geocodificação de endereço via Nominatim — live, sem chave.',
      category: 'data',
      docsUrl: 'https://nominatim.openstreetmap.org',
      configured: geo.configured,
      mock: !geo.configured,
    },
  ];
}

export { OpenDesignClient, WhatsAppClient, CrieClient };
