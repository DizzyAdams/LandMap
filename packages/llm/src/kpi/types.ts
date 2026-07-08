/**
 * Local structural copy of `@landmap/db`'s `Property`.
 *
 * We intentionally avoid a hard dependency on `@landmap/db` here so the `llm`
 * package stays self-contained; the shape is identical, so values produced by
 * the API (typed via `@landmap/db`) are assignable to `Property[]`.
 */
export interface Property {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  areaM2: number;
  bedrooms?: number;
  type: 'apartamento' | 'casa' | 'terreno' | 'comercial';
  modality: 'venda' | 'aluguel' | 'lancamento';
  available: boolean;
  latitude?: number;
  longitude?: number;
  neighborhood?: string;
  zone?: string;
  street?: string;
  status: 'active' | 'sold' | 'rented' | 'reserved';
  createdAt: string;
  updatedAt: string;
  images: string[];
  tags: string[];
}

export interface CityAggregate {
  city: string;
  state: string;
  count: number;
  avgPrice: number;
  avgPricePerSqm: number;
}

export interface MarketKpis {
  total: number;
  avgPrice: number;
  medianPrice: number;
  avgPricePerSqm: number;
  medianPricePerSqm: number;
  /** Share of inventory available for sale (not sold/rented). */
  availabilityRate: number;
  /** Share of inventory for rent vs sale. */
  rentShare: number;
  byType: Record<string, number>;
  byModality: Record<string, number>;
  cities: CityAggregate[];
}

export interface MarketFeatures {
  /** Normalized 0..1 features used by the rulers. */
  priceLevel: number;
  density: number;
  affordability: number;
  liquidity: number;
  growthSignal: number;
}

export type RulerName = 'claude' | 'jpmorgan' | 'quantum';

export interface RulerScore {
  ruler: RulerName;
  score: number;
  label: string;
  commentary: string;
}

