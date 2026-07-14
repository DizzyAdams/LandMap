'use client';

import { useState, useEffect } from 'react';
import { BellRing } from '../../../../components/lovable/icons';

type Settings = {
  platformName: string;
  contactEmail: string;
  apiBaseUrl: string;
};

const STORAGE_KEY = 'landmap_admin_settings';
const DEFAULTS: Settings = {
  platformName: 'LandMap',
  contactEmail: 'contato@landmap.com.br',
  apiBaseUrl: 'https://api.landmap.com.br',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings(JSON.parse(stored));
    } catch {}
  }, []);

  function handleChange<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    setSettings(DEFAULTS);
    localStorage.removeItem(STORAGE_KEY);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--primary)]">
          <BellRing className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">Plataforma</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--foreground)]">Configurações</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">Configurações gerais da plataforma</p>
        </div>
      </header>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 max-w-lg">
        <div className="space-y-5">
          <Field label="Nome da Plataforma">
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => handleChange('platformName', e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)]"
            />
          </Field>

          <Field label="Email de Contato">
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)]"
            />
          </Field>

          <Field label="API Base URL">
            <input
              type="url"
              value={settings.apiBaseUrl}
              onChange={(e) => handleChange('apiBaseUrl', e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)]"
            />
          </Field>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--primary-foreground)] transition hover:bg-[var(--primary)]/90"
            >
              {saved ? '✓ Salvo' : 'Salvar'}
            </button>
            <button
              onClick={handleReset}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-xs text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
            >
              Restaurar Padrões
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-[var(--muted-foreground)]">{label}</span>
      {children}
    </label>
  );
}
