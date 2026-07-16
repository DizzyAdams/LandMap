/** Pure geo helpers (no React / no fetch). */

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function gradeToken(grade?: string): string {
  switch ((grade || '').toUpperCase()) {
    case 'A':
      return 'var(--success)';
    case 'B':
      return 'var(--primary)';
    case 'C':
      return 'var(--accent)';
    case 'D':
      return 'var(--warning)';
    case 'F':
      return 'var(--danger)';
    default:
      return 'var(--muted-foreground)';
  }
}

export function propertyGrade(p: {
  grade?: string;
  invest?: { grade?: string; score?: number };
  score?: number;
}): string {
  return (p.grade || p.invest?.grade || 'C').toUpperCase();
}

export function propertyScore(p: {
  score?: number;
  invest?: { score?: number };
}): number {
  return p.score ?? p.invest?.score ?? 0;
}
