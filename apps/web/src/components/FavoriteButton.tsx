'use client';

import React from 'react';
import { useFavorites } from '../lib/favorites';
import { Heart } from './lovable/icons';

export function FavoriteButton({ propertyId, className = '' }: { propertyId: string; className?: string }) {
  const { isFavorite, toggle, hydrated } = useFavorites();

  if (!hydrated) {
    return (
      <button
        className={
          'inline-flex items-center justify-center rounded-full p-2 text-[var(--muted-foreground)] opacity-50 cursor-not-allowed'
        }
        disabled
        aria-hidden="true"
      >
        <Heart size={20} filled={false} strokeWidth={2} />
      </button>
    );
  }

  const active = isFavorite(propertyId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(propertyId);
      }}
      className={
        className ||
        'inline-flex items-center justify-center rounded-full p-2 transition-colors duration-200'
      }
      aria-label={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      title={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Heart size={20} filled={active} strokeWidth={2} />
    </button>
  );
}
