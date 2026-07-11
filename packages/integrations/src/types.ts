export type DesignAssetKind =
  | 'frame'
  | 'component'
  | 'token'
  | 'prototype'
  | 'image';

export interface DesignAsset {
  id: string;
  name: string;
  kind: DesignAssetKind;
  url?: string;
  thumbnailUrl?: string;
  updatedAt: string;
  source: 'opendesign';
}

export interface OpenDesignConfig {
  apiKey?: string;
  baseUrl?: string;
}

/* ─── WhatsApp Business Cloud API (WABA) ─── */

export interface WhatsAppConfig {
  accessToken?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  webhookVerifyToken?: string;
  apiVersion?: string;
  baseUrl?: string;
}

export interface WhatsAppMessage {
  id?: string;
  from?: string;
  to?: string;
  timestamp?: string;
  type?: string;
  text?: { body: string };
  [key: string]: unknown;
}

export interface WhatsAppSendResult {
  id: string;
  to: string;
  type: string;
  status: 'sent' | 'mock_sent';
  mock: boolean;
  generatedAt: string;
}

/* ─── CRIE — Registro de Imóveis Eletrônico ─── */

export interface CrieConfig {
  apiKey?: string;
  baseUrl?: string;
}

export interface CrieRecord {
  matricula: string;
  cartorio: string;
  comarca: string;
  proprietario: string;
  areaM2: number;
  situacao: 'ativo' | 'com_onus';
  onus: 'nenhum' | 'hipoteca' | 'penhora';
  dataRegistro: string;
  fonte: string;
}

/* ─── ViaCEP (public CEP → address, no key) ─── */

export interface ViaCepConfig {
  baseUrl?: string;
}

export interface ViaCepAddress {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

/* ─── IBGE (public UF / cities, no key) ─── */

export interface IbgeConfig {
  baseUrl?: string;
}

export interface IbgeUf {
  id: number;
  sigla: string;
  nome: string;
}

export interface IbgeCity {
  id: number;
  nome: string;
}

/* ─── Leilão (imóveis em leilão, tempo real) ─── */

export interface LeilaoConfig {
  baseUrl?: string;
}

export interface LeilaoLot {
  id: string;
  tipo: 'judicial' | 'caixa' | 'precomposicao';
  comarca: string;
  uf: string;
  bem: string;
  matricula?: string;
  avaliacao: number;
  lanceMinimo: number;
  abertura: string;
  encerramento: string;
  status: 'aberto' | 'andamento' | 'adjudicado' | 'suspenso';
  novo: boolean;
  link: string;
  fonte: string;
}

/* ─── Câmbio (BCB via AwesomeAPI, live, no key) ─── */

export interface CambioConfig {
  baseUrl?: string;
}

export interface CambioQuote {
  pair: string;
  bid: number;
  ask: number;
  updatedAt: string;
}

/* ─── Twenty CRM (thin status wrapper) ─── */

export interface TwentyConfig {
  baseUrl?: string;
}

