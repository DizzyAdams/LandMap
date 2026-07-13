'use client';

import { useTranslations } from 'next-intl';
import { Reveal } from '../../../components/Motion';
import BmapViewer from '../../../components/BmapViewer';

export default function WorldPage() {
  const t = useTranslations('world');
  return (
    <main className="min-h-screen grid-bg text-[var(--foreground)]">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-3">
                <span className="kicker">Mercado Global</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-gradient">
                {t('title')}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-8">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 p-2">
            <BmapViewer />
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mt-6">
          <p className="text-xs text-[var(--muted-foreground)]">{t('hint')}</p>
        </Reveal>
      </section>
    </main>
  );
}
