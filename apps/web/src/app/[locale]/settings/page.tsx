'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Card, Badge, Button } from '@landmap/ui';
import { ArrowLeft, LandMapWordmark, User, Bell, ShieldCheck, Check } from '../../../components/lovable/icons';
import { readMockUser } from '../../../lib/mockAuth';
import { planMeta, type PlanId } from '../../../lib/plans';

type Settings = { weeklyEmail: boolean; compact: boolean; reduceMotion: boolean };

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-[var(--border)] transition ${
        checked ? 'bg-[var(--primary)]' : 'bg-[var(--card)]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-[var(--background)] transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const locale = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('free');
  const [settings, setSettings] = useState<Settings>({ weeklyEmail: true, compact: false, reduceMotion: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const u = readMockUser();
      if (u) {
        setName(u.name ?? '');
        setEmail(u.email ?? '');
        setPlan(u.plan ?? 'free');
      }
      const raw = localStorage.getItem('landmap:settings');
      if (raw) setSettings(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  function persistProfile() {
    try {
      const u = readMockUser();
      localStorage.setItem('landmap_mock_user', JSON.stringify({ ...u, name, email }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch {
      /* noop */
    }
  }

  function updateSetting(key: keyof Settings, value: boolean) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    try {
      localStorage.setItem('landmap:settings', JSON.stringify(next));
    } catch {
      /* noop */
    }
  }

  return (
    <ProductPageShell
      backHref={`/${locale}`}
      eyebrow="Conta"
      title="Configurações"
      description="Gerencie seu perfil, preferências e plano."
      maxWidth="5xl"
    >
      <div className="space-y-5">
        <Card variant="default" className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--foreground)]">Perfil</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs text-[var(--muted-foreground)]">Nome</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus-visible:shadow-[var(--ring)]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[var(--muted-foreground)]">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus-visible:shadow-[var(--ring)]"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={persistProfile}>Salvar perfil</Button>
            {saved && (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--success)]">
                <Check className="h-3.5 w-3.5" /> Salvo
              </span>
            )}
          </div>
        </Card>

        <Card variant="default" className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--foreground)]">Preferências</h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {([
              ['weeklyEmail', 'Resumo semanal por e-mail'],
              ['compact', 'Modo compacto'],
              ['reduceMotion', 'Reduzir animações'],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between py-3">
                <span className="text-sm text-[var(--foreground)]">{label}</span>
                <Toggle checked={settings[key]} onChange={(v) => updateSetting(key, v)} label={label} />
              </div>
            ))}
          </div>
        </Card>

        <Card variant="default" className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--foreground)]">Plano</h2>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{planMeta(plan as PlanId)?.name ?? 'Free'}</Badge>
              <span className="text-sm text-[var(--muted-foreground)]">Seu plano atual</span>
            </div>
            <Link href={`/${locale}/plans`}>
              <Button variant="outline">Ver planos</Button>
            </Link>
          </div>
        </Card>
      </div>
    </ProductPageShell>
  );
}
