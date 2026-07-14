import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Card, EmptyState } from '@landmap/ui';
import { GitCompare } from '../../../components/lovable/icons';

export default function ComparePage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { ids?: string };
}) {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const ids = searchParams.ids ? searchParams.ids.split(',').filter(Boolean) : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--primary)]">
            <GitCompare className="h-4 w-4" />
            Comparação
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Comparar imóveis</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">
            Diff de preço, área e quartos entre os imóveis selecionados.
          </p>
        </div>
        <Link
          href={lh('/search')}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90"
        >
          Ir para busca
        </Link>
      </header>

      {ids.length === 0 ? (
        <EmptyState
          title="Nenhum imóvel selecionado para comparação."
          description="Selecione imóveis na busca para compará-los lado a lado."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {ids.map((id) => (
            <Card key={id}>
              <p className="text-sm font-medium">Imóvel {id}</p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Detalhes carregados do banco de dados.
              </p>
            </Card>
          ))}
        </div>
      )}

      <div>
        <Link href={lh('/search')} className="text-sm text-[var(--primary)] hover:underline">
          Voltar para busca
        </Link>
      </div>
    </div>
  );
}
