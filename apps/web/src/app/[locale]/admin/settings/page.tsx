'use client';

import { useState, useEffect } from 'react';

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
    <div>
      <h2 className="text-lg font-medium text-neutral-50">Configurações</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Configurações gerais da plataforma
      </p>

      <div className="mt-8 max-w-lg space-y-5">
        <Field label="Nome da Plataforma">
          <input
            type="text"
            value={settings.platformName}
            onChange={(e) => handleChange('platformName', e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-50 outline-none placeholder:text-neutral-700 focus:border-neutral-500"
          />
        </Field>

        <Field label="Email de Contato">
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => handleChange('contactEmail', e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-50 outline-none placeholder:text-neutral-700 focus:border-neutral-500"
          />
        </Field>

        <Field label="API Base URL">
          <input
            type="url"
            value={settings.apiBaseUrl}
            onChange={(e) => handleChange('apiBaseUrl', e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-50 outline-none placeholder:text-neutral-700 focus:border-neutral-500"
          />
        </Field>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="rounded-lg bg-neutral-50 px-4 py-2 text-xs font-medium text-[#050505] transition hover:bg-neutral-200"
          >
            {saved ? '✓ Salvo' : 'Salvar'}
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg border border-neutral-800 px-4 py-2 text-xs text-neutral-400 transition hover:text-white"
          >
            Restaurar Padrões
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-neutral-500">{label}</span>
      {children}
    </label>
  );
}
