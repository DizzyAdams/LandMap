'use client';

import { useState } from 'react';

type GalleryProps = {
  images: string[];
  title: string;
};

export function Gallery({ images, title }: GalleryProps) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)]/40">
        <svg className="h-10 w-10 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const img = images[current];

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]/40">
      {/* Main image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--card)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={`${title} — foto ${current + 1}`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {/* Counter */}
        <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2.5 py-1 text-xs text-[var(--muted-foreground)]">
          {current + 1} / {images.length}
        </div>
      </div>

      {/* Navigation */}
      {images.length > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3">
          <div className="flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 w-2 rounded-full transition ${
                  i === current ? 'bg-[var(--card)] border border-[var(--border)]' : 'bg-neutral-700 hover:bg-neutral-500'
                }`}
                aria-label={`Foto ${i + 1}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrent((p) => (p === 0 ? images.length - 1 : p - 1))}
              disabled={images.length <= 1}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)]/60 px-3 py-1.5 text-xs text-[var(--muted-foreground)] transition hover:border-[var(--border)] hover:text-[var(--foreground)] disabled:opacity-30"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setCurrent((p) => (p === images.length - 1 ? 0 : p + 1))}
              disabled={images.length <= 1}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)]/60 px-3 py-1.5 text-xs text-[var(--muted-foreground)] transition hover:border-[var(--border)] hover:text-[var(--foreground)] disabled:opacity-30"
            >
              Próxima →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
