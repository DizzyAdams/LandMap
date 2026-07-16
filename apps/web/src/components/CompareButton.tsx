'use client';

import React, { useState, useEffect } from 'react';
import { Check, Plus } from './lovable/icons';

export function getCompareIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const ids = localStorage.getItem('landmap-compare-ids');
    return ids ? JSON.parse(ids) : [];
  } catch {
    return [];
  }
}

export function toggleCompareId(id: string) {
  if (typeof window === 'undefined') return;
  const current = getCompareIds();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  localStorage.setItem('landmap-compare-ids', JSON.stringify(next));
  window.dispatchEvent(new Event('compare-updated'));
}

export function CompareButton({ id, className }: { id: string; className?: string }) {
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setSelected(getCompareIds().includes(id));
    };
    handleUpdate();
    window.addEventListener('compare-updated', handleUpdate);
    return () => window.removeEventListener('compare-updated', handleUpdate);
  }, [id]);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCompareId(id);
      }}
      className={`flex items-center justify-center rounded-full p-2 transition-colors ${selected ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'hover:bg-[var(--muted)] text-[var(--muted-foreground)]'} ${className ?? ''}`}
      aria-label={selected ? 'Remover da comparação' : 'Adicionar à comparação'}
      title={selected ? 'Remover da comparação' : 'Adicionar à comparação'}
    >
      {selected ? <Check size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}
    </button>
  );
}
