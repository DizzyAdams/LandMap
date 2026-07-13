import React from 'react';
import Link from 'next/link';

export default function ComparePage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { ids?: string };
}) {
  const locale = params.locale;
  const lh = (p: string) => `/${locale}${p}`;
  const ids = searchParams.ids ? searchParams.ids.split(',').filter(Boolean) : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="text-sm font-medium text-[var(--primary)]">Comparação</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Comparar imóveis</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          Diff de preço, área e quartos entre os imóveis selecionados.
        </p>
      </header>

      {ids.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-8 text-center">
          <p className="text-[var(--muted-foreground)]">Nenhum imóvel selecionado para comparação.</p>
          <Link
            href={lh('/search')}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] transition hover:bg-[color:color-mix(in_srgb,var(--primary)_90%,transparent)]"
          >
            Ir para busca
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {ids.map((id) => (
            <div key={id} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
              <p className="text-sm font-medium">Imóvel {id}</p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Detalhes carregados do banco de dados.
              </p>
            </div>
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
