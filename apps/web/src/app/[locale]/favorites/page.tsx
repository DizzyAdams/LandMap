'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button, Card } from '@landmap/ui';

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
      <main className="min-h-screen bg-[#050505] px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">
            Favoritos
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">
          Favoritos
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          {favorites.length} imóve{favorites.length === 1 ? 'l' : 'is'} salvo
         {favorites.length === 1 ? '' : 's'}
        </p>

        {favorites.length === 0 ? (
          <Card variant="default" className="mt-8 text-center text-neutral-500">
            <p>Nenhum imóvel favoritado ainda.</p>
            <Link href={`/${locale}/search`}>
              <Button variant="default" className="mt-4">
                Buscar imóveis
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav) => (
              <Card key={fav.id} variant="interactive">
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
