'use client';

import React, { useState, useEffect } from 'react';
import { getCompareIds } from './CompareButton';
import { Button } from '@landmap/ui';
import { useParams, useRouter } from 'next/navigation';

export function CompareWidget() {
  const [ids, setIds] = useState<string[]>([]);
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'pt-BR';

  useEffect(() => {
    const handleUpdate = () => {
      setIds(getCompareIds());
    };
    handleUpdate();
    window.addEventListener('compare-updated', handleUpdate);
    return () => window.removeEventListener('compare-updated', handleUpdate);
  }, []);

  if (ids.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="glass flex items-center gap-4 rounded-full border border-[var(--border)] px-4 py-2 shadow-xl shadow-black/20 bg-[var(--card)]">
        <span className="text-sm font-medium text-[var(--foreground)]">
          {ids.length} {ids.length === 1 ? 'imóvel selecionado' : 'imóveis selecionados'}
        </span>
        <Button
          size="sm"
          className="cta-glow rounded-full text-xs"
          onClick={() => {
            router.push(`/${locale}/compare?ids=${ids.join(',')}`);
          }}
        >
          Comparar
        </Button>
      </div>
    </div>
  );
}
