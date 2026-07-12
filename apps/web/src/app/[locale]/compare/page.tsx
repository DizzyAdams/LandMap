import Link from 'next/link';
import { LANDMAP_API_BASE, type Property } from '../../../lib/api';
import { EmptyState, Button } from '@landmap/ui';
import { Reveal } from '../../../components/Motion';

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
    <main className="min-h-screen grid-bg px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/${locale}/search`}
          className="text-xs text-[var(--muted-foreground-lovable)] transition hover:text-[var(--foreground)]"
        >
          ← Voltar para busca
        </Link>

        <div className="mt-4">
          <span className="kicker">Análise Comparativa</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gradient">
          Comparar imóveis
        </h1>

        {idList.length === 0 && (
          <EmptyState
            title="Nenhum imóvel selecionado"
            description="Adicione IDs na URL para comparar, por exemplo ?ids=1,2,3."
          >
            <Link href={`/${locale}/search`}>
              <Button className="mt-4 cta-glow">Buscar imóveis</Button>
            </Link>
          </EmptyState>
        )}

        {idList.length > 0 && properties.length === 0 && (
          <EmptyState
            title="Nenhum imóvel encontrado"
            description="Não localizamos imóveis para os IDs informados. Verifique a URL."
          />
        )}

        {properties.length > 0 && (
          <Reveal className="mt-6">
            <div className="rounded-2xl border border-[var(--border-lovable)] bg-[var(--card)] p-4 overflow-x-auto p-2">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Comparação lado a lado de imóveis</caption>
              <thead>
                <tr className="border-b border-[var(--border-lovable)] text-left text-xs text-[var(--muted-foreground-lovable)]">
                  <th scope="col" className="py-3 pr-4">Atributo</th>
                  {properties.map((p) => (
                    <th key={p.id} scope="col" className="py-3 px-4 font-medium text-[var(--foreground)]">
                      {p.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[var(--muted-foreground-lovable)]">
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
                    <th scope="row" className="py-3 pr-4 text-left text-xs font-normal text-[var(--muted-foreground-lovable)]">{row.label}</th>
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
          </Reveal>
        )}
      </div>
    </main>
  );
}
