import { AlertTriangle, Activity } from './lovable/icons';

type Variant = 'api' | 'datadog';

const COPY: Record<Variant, { label: string; text: string }> = {
  api: {
    label: 'API',
    text: 'Need recharge api — os modelos de IA estão em modo demo. Conecte a API paga para ativar.',
  },
  datadog: {
    label: 'Observability',
    text: 'Datadog — telemetria e traces enviados para o pipeline de observabilidade.',
  },
};

export function ApiNotice({ variant = 'api', className = '' }: { variant?: Variant; className?: string }) {
  const c = COPY[variant];
  const Icon = variant === 'api' ? AlertTriangle : Activity;
  return (
    <div
      role="status"
      className={`flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-foreground/60 ${className}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
      <span className="font-medium text-foreground/80">{c.label}:</span>
      <span>{c.text}</span>
    </div>
  );
}
