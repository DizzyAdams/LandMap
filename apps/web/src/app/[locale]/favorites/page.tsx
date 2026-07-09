'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button, EmptyState } from '@landmap/ui';
import { Reveal } from '../../../components/Motion';
import { SpotlightCard } from '../../../components/SpotlightCard';

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
      <main className="min-h-screen grid-bg px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">
            Favoritos
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid-bg px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h1 className="text-2xl font-semibold tracking-tight text-gradient">
            Favoritos
          </h1>
          <p className="mt-1 text-sm text-neutral-400" aria-live="polite">
            {favorites.length} imóve{favorites.length === 1 ? 'l' : 'is'} salvo
           {favorites.length === 1 ? '' : 's'}
          </p>
        </Reveal>

        {favorites.length === 0 ? (
          <EmptyState
            title="Nenhum imóvel favoritado ainda"
            description="Explore o catálogo e salve seus imóveis preferidos para compará-los depois."
          >
            <Link href={`/${locale}/search`}>
              <Button className="mt-4">Buscar imóveis</Button>
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
      </div>
    </main>
  );
}
