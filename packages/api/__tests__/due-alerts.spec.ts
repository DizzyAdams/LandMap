import { describe, it, expect } from 'vitest';
import { createInitialStore } from '@landmap/sales';
import { computeDueAlerts, dueAlertSummary } from '../src/crm/due-alerts';

describe('due alerts', () => {
  it('flags overdue and due_soon follow-ups from seed', () => {
    const store = createInitialStore();
    const alerts = computeDueAlerts(store);
    const summary = dueAlertSummary(alerts);
    expect(summary.overdue).toBeGreaterThanOrEqual(1);
    expect(summary.dueSoon).toBeGreaterThanOrEqual(1);
    expect(alerts.every((a) => a.severity === 'overdue' || a.severity === 'due_soon')).toBe(true);
  });
});
