'use client';

import { useEffect } from 'react';
import { addRecentlyViewed } from '../../../../lib/recently-viewed';

type Props = {
  id: string;
  title: string;
  city: string;
  price: number;
};

/** Tracks a property view in localStorage. Renders nothing. */
export function RecentlyViewedTracker({ id, title, city, price }: Props) {
  useEffect(() => {
    addRecentlyViewed(id, title, city, price);
  }, [id, title, city, price]);

  return null;
}
