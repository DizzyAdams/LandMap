'use client';

import { useEffect, useState } from 'react';
import { Eye } from './lovable/icons';

interface SocialProofProps {
  propertyId: string;
}

function getRandomViewers(): number {
  return Math.floor(Math.random() * 10) + 3; // 3-12
}

export function SocialProof({ propertyId }: SocialProofProps) {
  const [viewers, setViewers] = useState(0);

  useEffect(() => {
    setViewers(getRandomViewers());
    const interval = setInterval(() => {
      setViewers(getRandomViewers());
    }, 30000);

    return () => clearInterval(interval);
  }, [propertyId]);

  if (viewers === 0) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 text-xs text-[var(--muted-foreground)]">
      <Eye className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden />
      <span>
        <strong className="font-medium text-[var(--foreground)]">{viewers}</strong> pessoas estão vendo este imóvel agora
      </span>
    </div>
  );
}
