/* ------------------------------------------------------------------ */
/*  Observability callback handler                                    */
/*  Minimal, side-effect free collector for latency / tokens / errors */
/* ------------------------------------------------------------------ */

export type ToolEvent = {
  tool: string;
  input: any;
  output?: any;
  error?: string;
  startedAt: number;
  finishedAt: number;
  durationMs: number;
  tokensIn?: number;
  tokensOut?: number;
};

export type AgentMetrics = {
  events: ToolEvent[];
  totalCalls: number;
  errors: number;
  totalDurationMs: number;
  avgDurationMs: number;
  totalTokensIn: number;
  totalTokensOut: number;
};

type Listener = (event: ToolEvent) => void;

/**
 * Simple in-process metrics recorder.
 *
 * Use:
 *   const obs = createObservability();
 *   const result = await withObservability(obs, 'scoreLead', input, scoreLeadTool);
 */
export type Observability = {
  record(event: ToolEvent): void;
  summary(): AgentMetrics;
  reset(): void;
  on(listener: Listener): () => void;
};

export function createObservability(): Observability {
  const events: ToolEvent[] = [];
  const listeners = new Set<Listener>();

  return {
    record(event: ToolEvent) {
      events.push(event);
      for (const fn of listeners) fn(event);
    },

    summary(): AgentMetrics {
      const totalCalls = events.length;
      const errors = events.filter((e) => !!e.error).length;
      const totalDurationMs = events.reduce((s, e) => s + e.durationMs, 0);
      const totalTokensIn = events.reduce((s, e) => s + (e.tokensIn ?? 0), 0);
      const totalTokensOut = events.reduce((s, e) => s + (e.tokensOut ?? 0), 0);

      return {
        events: events.slice(),
        totalCalls,
        errors,
        totalDurationMs,
        avgDurationMs: totalCalls > 0 ? Math.round(totalDurationMs / totalCalls) : 0,
        totalTokensIn,
        totalTokensOut,
      };
    },

    reset() {
      events.length = 0;
    },

    on(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export type WithObservabilityInput<T = any> = {
  toolName: string;
  input: any;
  run(input: any): Promise<{ ok: boolean; result: any; error?: string }>;
};

export async function withObservability<T = any>(obs: Observability, opts: WithObservabilityInput<T>): Promise<{ ok: boolean; result: any; error?: string }> {
  const startedAt = Date.now();
  let output: { ok: boolean; result: any; error?: string } | null = null;

  try {
    output = await opts.run(opts.input);
    return output;
  } finally {
    const finishedAt = Date.now();
    obs.record({
      tool: opts.toolName,
      input: opts.input,
      output: output?.result,
      error: output?.error,
      startedAt,
      finishedAt,
      durationMs: finishedAt - startedAt,
    });
  }
}
