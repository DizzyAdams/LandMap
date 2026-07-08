'use client';

const STORAGE_KEY = 'landmap_recently_viewed';
const MAX_ITEMS = 20;

export type RecentlyViewedItem = {
  id: string;
  title: string;
  city: string;
  price: number;
};

function read(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: RecentlyViewedItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addRecentlyViewed(id: string, title: string, city: string, price: number): void {
  const current = read();
  const filtered = current.filter((item) => item.id !== id);
  const next = [{ id, title, city, price }, ...filtered].slice(0, MAX_ITEMS);
  write(next);
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  return read();
}

export function clearRecentlyViewed(): void {
  write([]);
}
