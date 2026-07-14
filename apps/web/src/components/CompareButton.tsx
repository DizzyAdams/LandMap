'use client';

import React, { useState, useEffect } from 'react';

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
      className={`flex items-center justify-center rounded-full p-2 transition-colors ${selected ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'hover:bg-[var(--muted)] text-[var(--muted-foreground)]'}`}
      aria-label={selected ? 'Remover da comparação' : 'Adicionar à comparação'}
      title={selected ? 'Remover da comparação' : 'Adicionar à comparação'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {selected ? (
          <path d="M20 6 9 17l-5-5" />
        ) : (
          <path d="M12 5v14m-7-7h14" />
        )}
      </svg>
    </button>
  );
}
