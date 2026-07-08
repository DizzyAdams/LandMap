'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Property } from './api';

const STORAGE_KEY = 'landmap_favorites';

/* ------------------------------------------------------------------ */
/*  Raw storage helpers (works outside React too)                     */
/* ------------------------------------------------------------------ */

function readIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

/** Add or remove an id. Returns the updated list. */
export function toggleFavoriteId(id: string): string[] {
  const current = readIds();
  const idx = current.indexOf(id);
  const next = idx === -1 ? [...current, id] : current.filter((x) => x !== id);
  writeIds(next);
  return next;
}

export function isFavoriteId(id: string): boolean {
  return readIds().includes(id);
}

export function getFavoriteIds(): string[] {
  return readIds();
}

export function clearFavorites(): void {
  writeIds([]);
}

/* ------------------------------------------------------------------ */
/*  React hook                                                        */
/* ------------------------------------------------------------------ */

export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIds(readIds());
    setHydrated(true);
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const idx = prev.indexOf(id);
      const next = idx === -1 ? [...prev, id] : prev.filter((x) => x !== id);
      writeIds(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => ids.includes(id),
    [ids],
  );

  const clear = useCallback(() => {
    writeIds([]);
    setIds([]);
  }, []);

  return { ids, hydrated, toggle, isFavorite, clear } as const;
}

/* ------------------------------------------------------------------ */
/*  Post-login sync helpers                                           */
/* ------------------------------------------------------------------ */

export type SyncPayload = {
  ids: string[];
  email?: string;
};

/**
 * Call after successful login to push local favorites to server and
 * pull any server-side favorites down.
 */
export async function syncFavoritesAfterLogin(email: string) {
  const local = readIds();

  try {
    const res = await fetch('/api/favorites/sync', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ids: local, email } satisfies SyncPayload),
    });

    if (!res.ok) return; // graceful fallback – keep local
    const data = (await res.json()) as { merged: string[] };
    writeIds(data.merged);
  } catch {
    /* offline — keep local */
  }
}

/** Merge a set of ids into the local store (used after server sync). */
export function mergeFavoriteIds(ids: string[]) {
  const current = readIds();
  const merged = Array.from(new Set([...current, ...ids]));
  writeIds(merged);
  return merged;
}
