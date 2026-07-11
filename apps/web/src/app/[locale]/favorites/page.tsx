'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button, EmptyState, Skeleton } from '@landmap/ui';
import { Reveal } from '../../../components/Motion';
import { SpotlightCard } from '../../../components/SpotlightCard';
import { GlowPanel } from '../../../components/GlowPanel';

interface Favorite {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  addedAt: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const locale = (params.locale as string) || 'pt-BR';

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('landmap_favorites');
      if (raw) {
        setFavorites(JSON.parse(raw));
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  function removeFavorite(id: string) {
    const next = favorites.filter((f) => f.id !== id);
    setFavorites(next);
    localStorage.setItem('landmap_favorites', JSON.stringify(next));
  }

  if (!mounted) {
    return (
      <main className="min-h-screen grid-bg px-6 py-16" aria-busy="true">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">
            Favoritos
          </h1>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-3 h-3 w-1/3" />
                <Skeleton className="mt-4 h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid-bg px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <span className="kicker">Seus imóveis salvos</span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gradient">
            Favoritos
          </h1>
          <p className="mt-1 text-sm text-neutral-400" aria-live="polite">
            {favorites.length} imóve{favorites.length === 1 ? 'l' : 'is'} salvo
           {favorites.length === 1 ? '' : 's'}
          </p>
        </Reveal>

        <GlowPanel className="mt-6 p-6">
        {favorites.length === 0 ? (
          <EmptyState
            title="Nenhum imóvel favoritado ainda"
            description="Explore o catálogo e salve seus imóveis preferidos para compará-los depois."
          >
            <Link href={`/${locale}/search`}>
              <Button className="mt-4 cta-glow">Buscar imóveis</Button>
            </Link>
          </EmptyState>
        ) : (
          <ul role="list" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav) => (
              <li key={fav.id}>
                <SpotlightCard>
                  <Link href={`/${locale}/property/${fav.id}`} className="block">
                    <h3 className="text-sm font-medium text-neutral-50">
                      {fav.title}
                    </h3>
                    <p className="mt-1 text-xs text-neutral-400">
                      {fav.city}, {fav.state}
                    </p>
                    <p className="mt-2 text-sm font-medium text-neutral-200">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 0,
                      }).format(fav.price)}
                    </p>
                  </Link>
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="mt-3 text-xs text-red-400 transition hover:text-red-300"
                  >
                    Remover
                  </button>
                </SpotlightCard>
              </li>
            ))}
          </ul>
        )}
        </GlowPanel>
      </div>
    </main>
  );
}
