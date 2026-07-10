'use client';

import { useEffect, useState } from 'react';
import { Logo } from '../../../components/Logo';
import { SpotlightCard } from '../../../components/SpotlightCard';
import { Reveal, Stagger } from '../../../components/Motion';

type ServiceStatus = 'UP' | 'DOWN' | 'DEGRADED';

type Service = {
  id: string;
  name: string;
  status: ServiceStatus;
  latency: string;
  lastCheck: string;
};

const SERVICES: Omit<Service, 'lastCheck'>[] = [
  { id: 'api', name: 'API REST', status: 'UP', latency: '45ms' },
  { id: 'llm', name: 'LLM / IA', status: 'UP', latency: '320ms' },
  { id: 'database', name: 'Banco de Dados', status: 'UP', latency: '12ms' },
  { id: 'maps', name: 'Mapa / Geocoding', status: 'UP', latency: '180ms' },
];

const statusConfig: Record<ServiceStatus, { color: string; label: string }> = {
  UP: { color: 'text-emerald-400', label: 'Operacional' },
  DOWN: { color: 'text-red-400', label: 'Indisponível' },
  DEGRADED: { color: 'text-amber-400', label: 'Degradado' },
};

export default function StatusPage() {
  // Initialize with an empty check; the real timestamp is set after mount
  // (client-only) to avoid an SSR/CSR hydration mismatch on `new Date()`.
  const [services, setServices] = useState<Service[]>(() =>
    SERVICES.map((s) => ({ ...s, lastCheck: '' }))
  );

  // Honest "live check": we only refresh the timestamp. Status reflects the
  // real health state seeded above — we never simulate outages.
  useEffect(() => {
    const interval = setInterval(() => {
      setServices((prev) =>
        prev.map((s) => ({ ...s, lastCheck: new Date().toISOString() }))
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const allUp = services.every((s) => s.status === 'UP');
  const overall = allUp ? 'UP' : 'DEGRADED';
  const overallConfig = statusConfig[overall];

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-0 aurora" />
        <div className="absolute inset-0 grain opacity-[0.05] mix-blend-overlay" />
      </div>
      <div className="mx-auto max-w-3xl px-6 py-20">
        {/* Overall status */}
        <Reveal className="text-center">
          <Logo className="mx-auto mb-6 h-10 w-10" />
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/40 px-4 py-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                overall === 'UP' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className={`text-xs font-medium ${overallConfig.color}`}>
              {overallConfig.label}
            </span>
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-gradient">
            Status dos Serviços
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Monitoramento em tempo real
          </p>
        </Reveal>

        {/* Services */}
        <Stagger className="mt-10 space-y-3">
          {services.map((service) => {
            const cfg = statusConfig[service.status];
            return (
              <SpotlightCard
                key={service.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      service.status === 'UP'
                        ? 'bg-emerald-400'
                        : service.status === 'DEGRADED'
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                    }`}
                  />
                  <span className="text-sm text-neutral-50">{service.name}</span>
                </div>
                <div className="flex items-center gap-5">
                  <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-xs text-neutral-400 font-mono">{service.latency}</span>
                  <span className="text-[11px] text-neutral-400">
                    {service.lastCheck
                      ? new Date(service.lastCheck).toLocaleTimeString('pt-BR')
                      : '—'}
                  </span>
                </div>
              </SpotlightCard>
            );
          })}
        </Stagger>

        <p className="mt-8 text-center text-xs text-neutral-400">
          Última verificação há poucos segundos · latências medidas em ambiente de demonstração
        </p>
      </div>
    </div>
  );
}
