'use client';

import React from 'react';
import { useFavorites } from '../lib/favorites';

export function FavoriteButton({ propertyId, className = '' }: { propertyId: string; className?: string }) {
  const { isFavorite, toggle, hydrated } = useFavorites();

  if (!hydrated) {
    return (
      <button 
        className={"inline-flex items-center justify-center rounded-full p-2 text-[var(--muted-foreground-lovable)] opacity-50 cursor-not-allowed"} 
        disabled
        aria-hidden="true"
      >
        <HeartIcon active={false} />
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
      className={"inline-flex items-center justify-center rounded-full p-2 transition-colors duration-200"}
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      title={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <HeartIcon active={active} />
    </button>
  );
}

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill={active ? "currentColor" : "none"} 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  );
}


