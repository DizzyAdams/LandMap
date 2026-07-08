import Link from 'next/link';
import { LANDMAP_API_BASE, type Property } from '../../../lib/api';

export const dynamic = 'force-dynamic';

interface ComparePageProps {
  params: Promise<{ locale?: string }>;
  searchParams: Promise<{ ids?: string }>;
}

async function fetchCompareProperties(ids: string[]): Promise<Property[]> {
  try {
    const params = new URLSearchParams();
    ids.forEach((id) => params.append('ids', id));
    const res = await fetch(
      `${LANDMAP_API_BASE}/compare?${params.toString()}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return [];
    return res.json() as Promise<Property[]>;
  } catch {
    return [];
  }
}

export default async function ComparePage({
  params,
  searchParams,
}: ComparePageProps) {
  const { locale } = await params;
  const { ids } = await searchParams;
  const idList = ids
    ? ids
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  let properties: Property[] = [];
  if (idList.length > 0) {
    properties = await fetchCompareProperties(idList);
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/${locale}/search`}
          className="text-xs text-neutral-400 transition hover:text-white"
        >
          ← Voltar para busca
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-50">
          Comparar imóveis
        </h1>

        {idList.length === 0 && (
          <p className="mt-6 text-sm text-neutral-400">
            Nenhum imóvel selecionado para comparação. Adicione IDs na URL:{' '}
            <code className="text-neutral-300">?ids=1,2,3</code>
          </p>
        )}

        {idList.length > 0 && properties.length === 0 && (
          <p className="mt-6 text-sm text-neutral-400">
            Nenhum imóvel encontrado para os IDs informados.
          </p>
        )}

        {properties.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-neutral-400">
                  <th className="py-3 pr-4">Atributo</th>
                  {properties.map((p) => (
                    <th key={p.id} className="py-3 px-4 font-medium text-neutral-200">
                      {p.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-neutral-300">
                {[
                  { label: 'Preço', get: (p: Property) =>
                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(p.price) },
                  { label: 'Área', get: (p: Property) => `${p.areaM2} m²` },
                  { label: 'Quartos', get: (p: Property) => p.bedrooms?.toString() ?? '-' },
                  { label: 'Tipo', get: (p: Property) => p.type },
                  { label: 'Modalidade', get: (p: Property) => p.modality },
                  { label: 'Cidade', get: (p: Property) => `${p.city}, ${p.state}` },
                  { label: 'Disponível', get: (p: Property) => p.available ? 'Sim' : 'Não' },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-xs text-neutral-500">{row.label}</td>
                    {properties.map((p) => (
                      <td key={p.id} className="py-3 px-4">
                        {row.get(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
