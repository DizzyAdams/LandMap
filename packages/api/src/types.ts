import type { Property } from '@landmap/db';

export type { Property };

export type SearchQuery = {
  q?: string;
  type?: Property['type'];
  modality?: Property['modality'];
  city?: string;
  state?: string;
};

export type SearchResponse = {
  items: Property[];
  total: number;
};

export type CityAggregation = {
  city: string;
  state: string;
  count: number;
  avgPrice: number;
};

export type StatsResponse = {
  totalProperties: number;
  totalCities: number;
  avgPrice: number;
  byType: Record<string, number>;
  byModality: Record<string, number>;
};
