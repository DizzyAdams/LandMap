'use client';

import { useEffect, useState } from 'react';

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
    <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-xs text-neutral-400">
      <svg
        className="h-3.5 w-3.5 text-emerald-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
      <span>
        <strong className="font-medium text-neutral-300">{viewers}</strong> pessoas estão vendo este imóvel agora
      </span>
    </div>
  );
}
