'use client';

import { useEffect, useState } from 'react';
import { Activity } from './lovable/icons';

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
          ? 'border-[var(--destructive)]/50 bg-[var(--destructive)]/30 text-[var(--destructive)]'
          : isUrgent
            ? 'border-[var(--warning)]/40 bg-[var(--warning)]/20 text-[var(--warning)]'
            : 'border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]'
      }`}
    >
      <Activity className={`h-3.5 w-3.5 ${isExpired || isUrgent ? 'text-[var(--destructive)]' : 'text-[var(--muted-foreground)]'}`} aria-hidden />
      {isExpired ? (
        <span className="font-medium text-[var(--destructive)]">Oferta encerrada</span>
      ) : (
        <span>
          Oferta termina em{' '}
          <strong className={isUrgent ? 'text-[var(--warning)]' : 'text-[var(--foreground)]'}>
            {formatTime(remaining)}
          </strong>
        </span>
      )}
    </div>
  );
}
