import React from 'react';
import Link from 'next/link';

export default function ComparePage({ searchParams }: { searchParams: { ids?: string } }) {
  const ids = searchParams.ids ? searchParams.ids.split(',') : [];

  return (
    <main className="min-h-screen grid-bg text-[var(--foreground)] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-8 text-gradient">Comparação de Imóveis</h1>
        {ids.length === 0 ? (
          <p>Nenhum imóvel selecionado para comparação.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ids.map(id => (
              <div key={id} className="border border-[var(--border-lovable)] p-4 rounded-xl bg-[var(--card)]">
                <p className="text-sm font-medium">Imóvel {id}</p>
                {/* Aqui seria feito o fetch dos dados reais do imóvel e exibido o diff */}
                <p className="text-xs text-[var(--muted-foreground-lovable)] mt-2">Detalhes carregados do banco de dados.</p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8">
          <Link href="/search" className="text-sm text-[var(--primary)] hover:underline">Voltar para busca</Link>
        </div>
      </div>
    </main>
  );
}
