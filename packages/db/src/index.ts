export type PropertyStatus = 'active' | 'sold' | 'rented' | 'reserved';

export type Property = {
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
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
  images: string[];
  tags: string[];
};

export type PriceHistory = {
  propertyId: string;
  date: string;
  price: number;
  event: 'listing' | 'reduction' | 'sold' | 'rented';
};

export type DbSchema = {
  properties: Property[];
};
