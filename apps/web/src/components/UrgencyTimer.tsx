'use client';

import { useEffect, useState } from 'react';

interface UrgencyTimerProps {
  expiresInMinutes?: number;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export function UrgencyTimer({ expiresInMinutes = 1440 }: UrgencyTimerProps) {
  const [remaining, setRemaining] = useState(expiresInMinutes * 60);

  useEffect(() => {
    if (remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [remaining]);

  const isExpired = remaining <= 0;
  const isUrgent = remaining < 3600; // < 1h

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
        isExpired
          ? 'border-red-900/50 bg-red-950/30 text-red-400'
          : isUrgent
            ? 'border-red-800/40 bg-red-950/20 text-red-300'
            : 'border-neutral-800 bg-neutral-900/60 text-neutral-400'
      }`}
    >
      <svg
        className={`h-3.5 w-3.5 ${isExpired || isUrgent ? 'text-red-400' : 'text-neutral-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {isExpired ? (
        <span className="font-medium text-red-400">Oferta encerrada</span>
      ) : (
        <span>
          Oferta termina em{' '}
          <strong className={isUrgent ? 'text-red-300' : 'text-neutral-300'}>
            {formatTime(remaining)}
          </strong>
        </span>
      )}
    </div>
  );
}
