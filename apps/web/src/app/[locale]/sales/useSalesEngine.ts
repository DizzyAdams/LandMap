'use client';

import { useCallback, useRef, useState } from 'react';
import {
  createInitialStore,
  runCycle,
  approveTask,
  rejectTask,
  setAutonomy,
  mulberry32,
  NoopCrm,
} from '@landmap/sales';
import type { SalesState, AutonomyLevel, AgentContext, SalesStore } from '@landmap/sales';

/**
 * Client-side façade over the autonomous sales engine. The same `@landmap/sales`
 * library powers the `/api/sales/*` routes, so the cockpit is a true frontend
 * for the agent — fully interactive without a backend round-trip.
 */
export function useSalesEngine() {
  const storeRef = useRef<SalesStore | null>(null);
  if (!storeRef.current) storeRef.current = createInitialStore();

  const [state, setState] = useState<SalesState>(() => storeRef.current!.toState());
  const [running, setRunning] = useState(false);

  const refresh = useCallback(() => setState(storeRef.current!.toState()), []);

  const buildCtx = useCallback((): AgentContext => {
    const store = storeRef.current!;
    return {
      store,
      autonomy: store.autonomy,
      rng: mulberry32((Date.now() & 0xffffffff) || 7),
      now: () => new Date().toISOString(),
      crm: new NoopCrm(),
    };
  }, []);

  const cycle = useCallback(async () => {
    setRunning(true);
    try {
      await runCycle(storeRef.current!, buildCtx());
      refresh();
    } finally {
      setRunning(false);
    }
  }, [buildCtx, refresh]);

  const setLevel = useCallback(
    (level: AutonomyLevel) => {
      setAutonomy(storeRef.current!, level);
      refresh();
    },
    [refresh],
  );

  const approve = useCallback(
    (id: string) => {
      approveTask(storeRef.current!, id);
      refresh();
    },
    [refresh],
  );

  const reject = useCallback(
    (id: string) => {
      rejectTask(storeRef.current!, id);
      refresh();
    },
    [refresh],
  );

  return { state, running, cycle, setLevel, approve, reject };
}
