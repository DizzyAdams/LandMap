import { NextResponse } from 'next/server';
import { loadMarketProperties } from '../../../../lib/serverData';
import { haversineKm, propertyGrade } from '../../../../lib/geoMath';
import type { Property } from '../../../../lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * GET /api/markdowns/:id — dossiê de ativo (schema v2) + comps resolvidos + vizinhos geo.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const params = await Promise.resolve(context.params);
  const id = params.id;
  const all = loadMarketProperties();
  const item = all.find((p) => p.id === id);
  if (!item) {
    return NextResponse.json({ error: 'Ativo não encontrado' }, { status: 404 });
  }

  const comps: Property[] = (item.comps || [])
    .map((cid) => all.find((p) => p.id === cid))
    .filter(Boolean) as Property[];

  let nearby: Array<Property & { distanceKm: number }> = [];
  if (item.latitude != null && item.longitude != null) {
    nearby = all
      .filter(
        (p) =>
          p.id !== item.id &&
          p.latitude != null &&
          p.longitude != null &&
          p.type === item.type,
      )
      .map((p) => ({
        ...p,
        distanceKm: Number(
          haversineKm(item.latitude!, item.longitude!, p.latitude!, p.longitude!).toFixed(2),
        ),
      }))
      .filter((p) => p.distanceKm <= 8)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 6);
  }

  return NextResponse.json(
    {
      item: {
        ...item,
        grade: propertyGrade(item),
      },
      comps,
      nearby,
      grade: propertyGrade(item),
    },
    { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' } },
  );
}
