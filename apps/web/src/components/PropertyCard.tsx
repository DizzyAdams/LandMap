import Link from 'next/link';

type Property = {
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
};

export function PropertyCard({ property }: { property: Property }) {
  const priceText =
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(
      property.price
    );

  return (
    <Link
      href={`/property/${property.id}`}
      className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 transition hover:border-neutral-500"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-300">{property.title}</p>
          <p className="mt-1 text-xs text-neutral-500">
            {property.city}, {property.state} · {property.areaM2} m²
            {property.bedrooms ? ` · ${property.bedrooms} quartos` : ''}
          </p>
        </div>
        <span className="text-xs text-neutral-400">{property.modality}</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium">{priceText}</span>
        <span className="text-xs text-neutral-400 capitalize">{property.type}</span>
      </div>
    </Link>
  );
}
