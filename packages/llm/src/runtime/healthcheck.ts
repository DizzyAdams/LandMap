export type HealthCheck = {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  detail?: string;
};

export type HealthCheckEnvelope = {
  ok: boolean;
  checks: HealthCheck[];
};

let correlationId = () => Math.random().toString(36).slice(2, 10);

export function setCorrelationId(value: string) {
  correlationId = () => value;
}

export function getCorrelationId() {
  return correlationId();
}

export async function runHealthChecks(): Promise<HealthCheckEnvelope> {
  const checks: HealthCheck[] = [];

  const packageOk = typeof process.versions !== 'undefined' && !!process.versions.node;
  checks.push({
    name: 'package',
    status: packageOk ? 'pass' : 'fail',
    detail: packageOk
      ? `node ${String(process.versions.node)}`
      : 'node runtime missing',
  });

  const llmConfigured = !!process.env.LANDMAP_LLM_KEY;
  checks.push({
    name: 'llm',
    status: llmConfigured ? 'pass' : 'warn',
    detail: llmConfigured ? 'LANDMAP_LLM_KEY is set' : 'LANDMAP_LLM_KEY is not set',
  });

  let vectorOk = false;
  try {
    const { getLlmConfig } = await import('../config/llm-config.js');
    const config = getLlmConfig();
    vectorOk = Boolean(config.vectorProvider);
  } catch {
    vectorOk = false;
  }
  checks.push({
    name: 'vector',
    status: vectorOk ? 'pass' : 'fail',
    detail: vectorOk ? 'vector provider configured' : 'vector provider not configured',
  });

  const failed = checks.some((c) => c.status === 'fail');
  return { ok: !failed, checks };
}
