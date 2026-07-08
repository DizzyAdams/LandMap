'use client';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type AlertFilter = {
  id: string;
  label: string;
  city?: string;
  type?: string;
  modality?: string;
  maxPrice?: number;
  minArea?: number;
  createdAt: string;
};

/* ------------------------------------------------------------------ */
/*  Storage helpers                                                   */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'landmap_alerts';

function readAlerts(): AlertFilter[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AlertFilter[]) : [];
  } catch {
    return [];
  }
}

function writeAlerts(alerts: AlertFilter[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

/* ------------------------------------------------------------------ */
/*  CRUD                                                              */
/* ------------------------------------------------------------------ */

/** Generate a short unique id. */
function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function createAlert(filter: Omit<AlertFilter, 'id' | 'createdAt'>): AlertFilter[] {
  const current = readAlerts();
  const alert: AlertFilter = { ...filter, id: uid(), createdAt: new Date().toISOString() };
  const next = [alert, ...current];
  writeAlerts(next);
  return next;
}

export function updateAlert(id: string, patch: Partial<Omit<AlertFilter, 'id' | 'createdAt'>>): AlertFilter[] {
  const current = readAlerts();
  const next = current.map((a) => (a.id === id ? { ...a, ...patch } : a));
  writeAlerts(next);
  return next;
}

export function deleteAlert(id: string): AlertFilter[] {
  const current = readAlerts();
  const next = current.filter((a) => a.id !== id);
  writeAlerts(next);
  return next;
}

export function getAlerts(): AlertFilter[] {
  return readAlerts();
}

export function clearAlerts(): void {
  writeAlerts([]);
}
