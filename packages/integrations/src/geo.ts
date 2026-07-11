/**
 * Geo — geocodificação e geocodificação reversa via Nominatim (OpenStreetMap).
 *
 * O Nominatim é keyless: basta enviar um cabeçalho `User-Agent` identificando
 * o cliente. Por isso `configured` é sempre `true` e `mock` sempre `false`.
 * Em caso de falha de rede, `geocode` devolve resultados sintéticos
 * determinísticos ao redor de São Paulo (-23.55, -46.63) e `reverse`
 * devolve `null`.
 */

export interface GeoConfig {
  baseUrl?: string;
  userAgent?: string;
}

export interface GeoResult {
  lat: number;
  lon: number;
  displayName: string;
  tipo: string;
}

const DEFAULT_BASE_URL = 'https://nominatim.openstreetmap.org';

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

const SAO_PAULO = { lat: -23.55, lon: -46.63 };

type NominatimPlace = {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
};

function mockGeocode(endereco: string, limit: number): GeoResult[] {
  const out: GeoResult[] = [];
  for (let i = 0; i < limit; i++) {
    const r = hash(`${endereco}:${i}`);
    const r2 = hash(`${endereco}:${i}:b`);
    out.push({
      lat: SAO_PAULO.lat + (r - 0.5) * 0.1,
      lon: SAO_PAULO.lon + (r2 - 0.5) * 0.1,
      displayName: `${endereco} (sintético ${i + 1})`,
      tipo: 'desconhecido',
    });
  }
  return out;
}

export class GeoClient {
  private readonly baseUrl: string;
  private readonly userAgent: string;

  constructor(config: GeoConfig = {}) {
    this.baseUrl =
      (config.baseUrl ?? process.env.GEO_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this.userAgent = config.userAgent ?? process.env.GEO_USER_AGENT ?? 'LandMap/1.0';
  }

  get configured(): boolean {
    return true;
  }

  get mock(): boolean {
    return false;
  }

  async geocode(endereco: string): Promise<GeoResult[]> {
    try {
      const res = await fetch(
        `${this.baseUrl}/search?q=${encodeURIComponent(endereco)}&format=json&limit=5`,
        { headers: { 'User-Agent': this.userAgent } },
      );
      if (!res.ok) throw new Error(`Geo API error ${res.status}`);
      const data = (await res.json()) as NominatimPlace[];
      return data.map((item) => ({
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        displayName: item.display_name,
        tipo: item.type,
      }));
    } catch {
      return mockGeocode(endereco, 5);
    }
  }

  async reverse(lat: number, lon: number): Promise<GeoResult | null> {
    try {
      const res = await fetch(
        `${this.baseUrl}/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { 'User-Agent': this.userAgent } },
      );
      if (!res.ok) throw new Error(`Geo API error ${res.status}`);
      const item = (await res.json()) as Partial<NominatimPlace>;
      if (!item || !item.display_name) return null;
      return {
        lat: parseFloat(item.lat ?? String(lat)),
        lon: parseFloat(item.lon ?? String(lon)),
        displayName: item.display_name,
        tipo: item.type ?? 'desconhecido',
      };
    } catch {
      return null;
    }
  }
}
