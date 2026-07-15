/**
 * Shared region dataset for Fortaleza, used by the Regiões, Favoritos and
 * Comparar screens so the favorites workflow stays consistent across routes.
 * (Lovable-equivalent data; single source of truth.)
 *
 * NOTE: intentionally NOT a `'use client'` module — it holds plain data and
 * pure helpers so both Server Components (e.g. /compare) and Client
 * Components (e.g. /regions, /favorites) can import it.
 */

export type Region = {
  id: string;
  name: string;
  avgObservedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number;
  dataPoints: number;
};

export const REGIONS: Region[] = [
  { id: '1', name: 'Meireles', avgObservedPrice: 9500, minPrice: 7800, maxPrice: 11200, confidence: 5, dataPoints: 1840 },
  { id: '2', name: 'Aldeota', avgObservedPrice: 8200, minPrice: 6800, maxPrice: 9600, confidence: 5, dataPoints: 1520 },
  { id: '3', name: 'Dionísio Torres', avgObservedPrice: 7800, minPrice: 6400, maxPrice: 9100, confidence: 4, dataPoints: 1310 },
  { id: '4', name: 'Cocó', avgObservedPrice: 7500, minPrice: 6100, maxPrice: 8800, confidence: 4, dataPoints: 1120 },
  { id: '5', name: 'Guararapes', avgObservedPrice: 7000, minPrice: 5600, maxPrice: 8400, confidence: 4, dataPoints: 980 },
  { id: '6', name: 'Praia do Futuro', avgObservedPrice: 6500, minPrice: 5200, maxPrice: 7900, confidence: 3, dataPoints: 870 },
  { id: '7', name: 'Fátima', avgObservedPrice: 5600, minPrice: 4400, maxPrice: 6800, confidence: 3, dataPoints: 760 },
  { id: '8', name: 'Benfica', avgObservedPrice: 5000, minPrice: 3900, maxPrice: 6200, confidence: 3, dataPoints: 640 },
];

export const getRegionById = (id: string): Region | undefined =>
  REGIONS.find((r) => r.id === id);

export const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export const fmtPrice = (v: number) => v.toLocaleString('pt-BR');
