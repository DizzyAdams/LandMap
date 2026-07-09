/**
 * Embedded worldwide geolocation dataset (no external API, no DB required).
 *
 * Curated from public-domain sources (Natural Earth admin-0/1, GeoNames
 * populated places). Coordinates are approximate centroids; `bbox` is
 * [west, south, east, north]. `enrichment` carries LandMap's real-estate
 * intelligence for markets where we have coverage — this is the product wedge.
 *
 * This is the in-memory default. A PostGIS-backed source (postgis.ts) takes
 * over automatically when DATABASE_URL is bound.
 */

export interface RawFeature {
  id: string;
  name: string;
  type: 'country' | 'state' | 'city';
  countryCode?: string;
  state?: string;
  city?: string;
  lat: number;
  lng: number;
  bbox?: [number, number, number, number];
  population?: number;
  enrichment?: {
    pricePerM2: number; // BRL / m²
    yoy: number; // annual variation %
    zoning: string;
    schools: number;
  };
}

export const WORLD: RawFeature[] = [
  /* ─── Countries (global) ─── */
  { id: 'br', name: 'Brasil', type: 'country', countryCode: 'BR', lat: -14.2, lng: -51.9, bbox: [-73.9, -33.7, -34.8, 5.3] },
  { id: 'us', name: 'United States', type: 'country', countryCode: 'US', lat: 39.8, lng: -98.6, bbox: [-124.7, 24.5, -66.9, 49.4] },
  { id: 'pt', name: 'Portugal', type: 'country', countryCode: 'PT', lat: 39.4, lng: -8.2, bbox: [-9.6, 36.9, -6.2, 42.2] },
  { id: 'es', name: 'Espanha', type: 'country', countryCode: 'ES', lat: 40.2, lng: -3.7, bbox: [-9.3, 35.9, 3.4, 43.8] },
  { id: 'ar', name: 'Argentina', type: 'country', countryCode: 'AR', lat: -38.4, lng: -63.6, bbox: [-73.6, -55.0, -53.6, -21.8] },
  { id: 'mx', name: 'México', type: 'country', countryCode: 'MX', lat: 23.6, lng: -102.5, bbox: [-117.1, 14.5, -86.8, 32.7] },
  { id: 'ca', name: 'Canada', type: 'country', countryCode: 'CA', lat: 56.1, lng: -106.3, bbox: [-141.0, 41.7, -52.6, 83.1] },
  { id: 'gb', name: 'United Kingdom', type: 'country', countryCode: 'GB', lat: 54.0, lng: -2.5, bbox: [-8.6, 49.9, 1.8, 58.7] },
  { id: 'fr', name: 'France', type: 'country', countryCode: 'FR', lat: 46.6, lng: 2.2, bbox: [-5.1, 41.3, 9.7, 51.1] },
  { id: 'de', name: 'Germany', type: 'country', countryCode: 'DE', lat: 51.2, lng: 10.4, bbox: [-1.4, 47.3, 11.4, 55.1] },
  { id: 'it', name: 'Italy', type: 'country', countryCode: 'IT', lat: 42.8, lng: 12.6, bbox: [6.6, 35.5, 18.5, 47.1] },
  { id: 'nl', name: 'Netherlands', type: 'country', countryCode: 'NL', lat: 52.1, lng: 5.3, bbox: [3.3, 50.8, 7.2, 53.6] },
  { id: 'jp', name: 'Japan', type: 'country', countryCode: 'JP', lat: 36.2, lng: 138.3, bbox: [122.9, 24.0, 145.8, 45.6] },
  { id: 'cn', name: 'China', type: 'country', countryCode: 'CN', lat: 35.9, lng: 104.2, bbox: [73.5, 18.2, 134.8, 53.6] },
  { id: 'in', name: 'India', type: 'country', countryCode: 'IN', lat: 22.4, lng: 78.7, bbox: [68.2, 7.2, 97.4, 35.5] },
  { id: 'au', name: 'Australia', type: 'country', countryCode: 'AU', lat: -25.3, lng: 133.8, bbox: [112.9, -43.6, 153.6, -10.7] },
  { id: 'za', name: 'South Africa', type: 'country', countryCode: 'ZA', lat: -30.6, lng: 22.9, bbox: [16.3, -34.8, 32.9, -22.1] },
  { id: 'co', name: 'Colombia', type: 'country', countryCode: 'CO', lat: 4.6, lng: -74.3, bbox: [-81.7, -4.2, -66.9, 12.4] },
  { id: 'cl', name: 'Chile', type: 'country', countryCode: 'CL', lat: -35.7, lng: -71.5, bbox: [-75.6, -56.0, -66.3, -17.5] },
  { id: 'pe', name: 'Peru', type: 'country', countryCode: 'PE', lat: -9.2, lng: -75.0, bbox: [-81.4, -18.4, -68.7, -0.0] },
  { id: 'uy', name: 'Uruguay', type: 'country', countryCode: 'UY', lat: -32.5, lng: -55.8, bbox: [-58.4, -35.0, -53.1, -30.1] },
  { id: 'py', name: 'Paraguay', type: 'country', countryCode: 'PY', lat: -23.4, lng: -58.4, bbox: [-62.6, -27.6, -54.3, -19.3] },
  { id: 'bo', name: 'Bolivia', type: 'country', countryCode: 'BO', lat: -16.3, lng: -63.6, bbox: [-69.6, -22.9, -57.5, -9.8] },
  { id: 'ec', name: 'Ecuador', type: 'country', countryCode: 'EC', lat: -1.8, lng: -78.2, bbox: [-81.0, -5.0, -75.2, 1.4] },
  { id: 'ao', name: 'Angola', type: 'country', countryCode: 'AO', lat: -11.2, lng: 17.9, bbox: [11.6, -18.0, 24.0, -4.4] },
  { id: 'mz', name: 'Mozambique', type: 'country', countryCode: 'MZ', lat: -18.7, lng: 35.5, bbox: [30.2, -26.8, 40.8, -10.3] },
  { id: 'cv', name: 'Cabo Verde', type: 'country', countryCode: 'CV', lat: 16.0, lng: -24.0, bbox: [-25.4, 14.8, -22.7, 17.2] },
  { id: 'ng', name: 'Nigeria', type: 'country', countryCode: 'NG', lat: 9.1, lng: 8.7, bbox: [2.7, 4.0, 14.7, 13.9] },
  { id: 'eg', name: 'Egypt', type: 'country', countryCode: 'EG', lat: 26.8, lng: 30.8, bbox: [24.7, 22.0, 36.9, 31.7] },
  { id: 'ae', name: 'United Arab Emirates', type: 'country', countryCode: 'AE', lat: 23.4, lng: 53.8, bbox: [51.5, 22.4, 56.4, 26.1] },
  { id: 'sg', name: 'Singapore', type: 'country', countryCode: 'SG', lat: 1.35, lng: 103.8, bbox: [103.6, 1.2, 104.0, 1.5] },
  { id: 'kr', name: 'South Korea', type: 'country', countryCode: 'KR', lat: 36.5, lng: 127.9, bbox: [126.0, 34.4, 129.6, 38.6] },
  { id: 'id', name: 'Indonesia', type: 'country', countryCode: 'ID', lat: -2.5, lng: 118.0, bbox: [95.0, -10.2, 141.0, 5.5] },
  { id: 'tr', name: 'Turkey', type: 'country', countryCode: 'TR', lat: 39.0, lng: 35.2, bbox: [25.7, 35.8, 44.8, 42.1] },
  { id: 'se', name: 'Sweden', type: 'country', countryCode: 'SE', lat: 60.1, lng: 18.6, bbox: [10.6, 55.3, 24.2, 69.1] },
  { id: 'no', name: 'Norway', type: 'country', countryCode: 'NO', lat: 60.5, lng: 8.5, bbox: [4.0, 58.0, 31.3, 71.0] },
  { id: 'ch', name: 'Switzerland', type: 'country', countryCode: 'CH', lat: 46.8, lng: 8.2, bbox: [5.9, 45.8, 10.5, 47.8] },
  { id: 'ie', name: 'Ireland', type: 'country', countryCode: 'IE', lat: 53.4, lng: -8.2, bbox: [-10.5, 51.4, -5.9, 55.4] },
  { id: 'nz', name: 'New Zealand', type: 'country', countryCode: 'NZ', lat: -41.0, lng: 172.8, bbox: [166.4, -47.0, 178.6, -34.0] },
  /* ─── Brazil states (admin-1) ─── */
  { id: 'br-sp', name: 'São Paulo', type: 'state', countryCode: 'BR', state: 'SP', lat: -22.5, lng: -49.0, bbox: [-53.1, -25.2, -44.1, -19.6] },
  { id: 'br-rj', name: 'Rio de Janeiro', type: 'state', countryCode: 'BR', state: 'RJ', lat: -22.9, lng: -43.4, bbox: [-44.9, -23.4, -40.9, -20.8] },
  { id: 'br-pr', name: 'Paraná', type: 'state', countryCode: 'BR', state: 'PR', lat: -24.5, lng: -51.4, bbox: [-54.6, -26.7, -48.5, -22.5] },
  { id: 'br-sc', name: 'Santa Catarina', type: 'state', countryCode: 'BR', state: 'SC', lat: -27.0, lng: -50.5, bbox: [-53.5, -29.2, -48.5, -26.0] },
  { id: 'br-rs', name: 'Rio Grande do Sul', type: 'state', countryCode: 'BR', state: 'RS', lat: -30.0, lng: -53.3, bbox: [-57.6, -33.7, -50.0, -27.1] },
  { id: 'br-mg', name: 'Minas Gerais', type: 'state', countryCode: 'BR', state: 'MG', lat: -18.5, lng: -44.5, bbox: [-51.0, -21.9, -42.0, -14.2] },
  { id: 'br-ba', name: 'Bahia', type: 'state', countryCode: 'BR', state: 'BA', lat: -12.9, lng: -41.3, bbox: [-44.8, -18.3, -38.4, -8.5] },
  { id: 'br-df', name: 'Distrito Federal', type: 'state', countryCode: 'BR', state: 'DF', lat: -15.8, lng: -47.9, bbox: [-48.0, -16.1, -47.3, -15.5] },
  { id: 'br-ce', name: 'Ceará', type: 'state', countryCode: 'BR', state: 'CE', lat: -5.5, lng: -39.5, bbox: [-41.5, -7.1, -37.5, -2.7] },
  { id: 'br-pe', name: 'Pernambuco', type: 'state', countryCode: 'BR', state: 'PE', lat: -8.5, lng: -38.5, bbox: [-41.0, -9.5, -34.8, -7.0] },
  { id: 'br-am', name: 'Amazonas', type: 'state', countryCode: 'BR', state: 'AM', lat: -4.5, lng: -63.0, bbox: [-73.9, -10.0, -56.0, 2.3] },
  { id: 'br-pa', name: 'Pará', type: 'state', countryCode: 'BR', state: 'PA', lat: -4.0, lng: -53.0, bbox: [-58.0, -11.0, -46.0, 1.0] },
  { id: 'br-go', name: 'Goiás', type: 'state', countryCode: 'BR', state: 'GO', lat: -15.5, lng: -49.5, bbox: [-53.0, -18.0, -45.0, -12.5] },
  { id: 'br-es', name: 'Espírito Santo', type: 'state', countryCode: 'BR', state: 'ES', lat: -19.5, lng: -40.5, bbox: [-41.3, -21.0, -39.5, -18.0] },
  { id: 'br-ma', name: 'Maranhão', type: 'state', countryCode: 'BR', state: 'MA', lat: -5.0, lng: -45.5, bbox: [-50.0, -10.5, -41.0, -1.0] },
  { id: 'br-mt', name: 'Mato Grosso', type: 'state', countryCode: 'BR', state: 'MT', lat: -13.0, lng: -56.0, bbox: [-61.0, -18.0, -50.0, -7.5] },
  { id: 'br-ms', name: 'Mato Grosso do Sul', type: 'state', countryCode: 'BR', state: 'MS', lat: -20.0, lng: -54.5, bbox: [-58.5, -23.5, -50.5, -17.0] },
  { id: 'br-pb', name: 'Paraíba', type: 'state', countryCode: 'BR', state: 'PB', lat: -7.5, lng: -36.5, bbox: [-38.5, -8.5, -34.8, -6.5] },
  { id: 'br-pi', name: 'Piauí', type: 'state', countryCode: 'BR', state: 'PI', lat: -8.0, lng: -43.5, bbox: [-45.5, -10.5, -40.5, -2.5] },
  { id: 'br-rn', name: 'Rio Grande do Norte', type: 'state', countryCode: 'BR', state: 'RN', lat: -5.7, lng: -36.5, bbox: [-38.5, -7.0, -34.8, -4.5] },
  { id: 'br-ro', name: 'Rondônia', type: 'state', countryCode: 'BR', state: 'RO', lat: -11.0, lng: -62.5, bbox: [-66.5, -13.5, -58.5, -8.5] },
  { id: 'br-rr', name: 'Roraima', type: 'state', countryCode: 'BR', state: 'RR', lat: -2.0, lng: -61.5, bbox: [-66.0, -5.5, -58.5, 1.5] },
  { id: 'br-se', name: 'Sergipe', type: 'state', countryCode: 'BR', state: 'SE', lat: -10.5, lng: -37.5, bbox: [-38.5, -12.0, -36.5, -9.5] },
  { id: 'br-to', name: 'Tocantins', type: 'state', countryCode: 'BR', state: 'TO', lat: -10.0, lng: -48.5, bbox: [-51.0, -13.0, -46.0, -5.5] },
  { id: 'br-ac', name: 'Acre', type: 'state', countryCode: 'BR', state: 'AC', lat: -9.5, lng: -70.0, bbox: [-74.0, -11.5, -66.5, -7.5] },
  { id: 'br-al', name: 'Alagoas', type: 'state', countryCode: 'BR', state: 'AL', lat: -9.5, lng: -36.5, bbox: [-38.5, -10.5, -35.0, -8.5] },
  { id: 'br-ap', name: 'Amapá', type: 'state', countryCode: 'BR', state: 'AP', lat: 1.0, lng: -52.0, bbox: [-56.0, -2.5, -49.5, 2.5] },
  /* ─── Cities (worldwide) — BR ones carry market enrichment ─── */
  // Brazil
  { id: 'c-saopaulo', name: 'São Paulo', type: 'city', countryCode: 'BR', state: 'SP', city: 'São Paulo', lat: -23.55, lng: -46.63, population: 12300000, enrichment: { pricePerM2: 10500, yoy: 8.5, zoning: 'ZR1', schools: 1200 } },
  { id: 'c-rio', name: 'Rio de Janeiro', type: 'city', countryCode: 'BR', state: 'RJ', city: 'Rio de Janeiro', lat: -22.91, lng: -43.17, population: 6700000, enrichment: { pricePerM2: 9800, yoy: 6.2, zoning: 'ZC1', schools: 900 } },
  { id: 'c-curitiba', name: 'Curitiba', type: 'city', countryCode: 'BR', state: 'PR', city: 'Curitiba', lat: -25.43, lng: -49.27, population: 1900000, enrichment: { pricePerM2: 7200, yoy: 9.1, zoning: 'ZR1', schools: 700 } },
  { id: 'c-floripa', name: 'Florianópolis', type: 'city', countryCode: 'BR', state: 'SC', city: 'Florianópolis', lat: -27.59, lng: -48.55, population: 520000, enrichment: { pricePerM2: 8400, yoy: 11.3, zoning: 'ZR2', schools: 420 } },
  { id: 'c-bc', name: 'Balneário Camboriú', type: 'city', countryCode: 'BR', state: 'SC', city: 'Balneário Camboriú', lat: -26.99, lng: -48.63, population: 160000, enrichment: { pricePerM2: 9500, yoy: 12.0, zoning: 'ZR1', schools: 120 } },
  { id: 'c-joinville', name: 'Joinville', type: 'city', countryCode: 'BR', state: 'SC', city: 'Joinville', lat: -26.30, lng: -48.85, population: 600000, enrichment: { pricePerM2: 5600, yoy: 7.4, zoning: 'ZR2', schools: 350 } },
  { id: 'c-poa', name: 'Porto Alegre', type: 'city', countryCode: 'BR', state: 'RS', city: 'Porto Alegre', lat: -30.03, lng: -51.23, population: 1500000, enrichment: { pricePerM2: 6800, yoy: 5.5, zoning: 'ZR1', schools: 500 } },
  { id: 'c-bh', name: 'Belo Horizonte', type: 'city', countryCode: 'BR', state: 'MG', city: 'Belo Horizonte', lat: -19.92, lng: -43.94, population: 2500000, enrichment: { pricePerM2: 6400, yoy: 4.8, zoning: 'ZR1', schools: 600 } },
  { id: 'c-bsb', name: 'Brasília', type: 'city', countryCode: 'BR', state: 'DF', city: 'Brasília', lat: -15.79, lng: -47.88, population: 3000000, enrichment: { pricePerM2: 8200, yoy: 3.9, zoning: 'ZR1', schools: 800 } },
  { id: 'c-salvador', name: 'Salvador', type: 'city', countryCode: 'BR', state: 'BA', city: 'Salvador', lat: -12.97, lng: -38.50, population: 2900000, enrichment: { pricePerM2: 5200, yoy: 6.7, zoning: 'ZP1', schools: 400 } },
  { id: 'c-recife', name: 'Recife', type: 'city', countryCode: 'BR', state: 'PE', city: 'Recife', lat: -8.05, lng: -34.90, population: 1600000, enrichment: { pricePerM2: 4800, yoy: 5.1, zoning: 'ZP1', schools: 350 } },
  { id: 'c-campinas', name: 'Campinas', type: 'city', countryCode: 'BR', state: 'SP', city: 'Campinas', lat: -22.91, lng: -47.06, population: 1200000, enrichment: { pricePerM2: 6800, yoy: 7.0, zoning: 'ZR1', schools: 300 } },
  // Americas / Europe
  { id: 'c-ny', name: 'New York', type: 'city', countryCode: 'US', state: 'NY', city: 'New York', lat: 40.71, lng: -74.01, population: 8400000 },
  { id: 'c-la', name: 'Los Angeles', type: 'city', countryCode: 'US', state: 'CA', city: 'Los Angeles', lat: 34.05, lng: -118.24, population: 3900000 },
  { id: 'c-miami', name: 'Miami', type: 'city', countryCode: 'US', state: 'FL', city: 'Miami', lat: 25.76, lng: -80.19, population: 470000 },
  { id: 'c-toronto', name: 'Toronto', type: 'city', countryCode: 'CA', state: 'ON', city: 'Toronto', lat: 43.65, lng: -79.38, population: 2900000 },
  { id: 'c-mexico', name: 'Mexico City', type: 'city', countryCode: 'MX', state: 'CDMX', city: 'Mexico City', lat: 19.43, lng: -99.13, population: 9200000 },
  { id: 'c-buenosaires', name: 'Buenos Aires', type: 'city', countryCode: 'AR', state: 'BA', city: 'Buenos Aires', lat: -34.60, lng: -58.38, population: 3100000 },
  { id: 'c-bogota', name: 'Bogotá', type: 'city', countryCode: 'CO', state: 'DC', city: 'Bogotá', lat: 4.71, lng: -74.07, population: 7900000 },
  { id: 'c-santiago', name: 'Santiago', type: 'city', countryCode: 'CL', state: 'RM', city: 'Santiago', lat: -33.45, lng: -70.66, population: 6500000 },
  { id: 'c-lima', name: 'Lima', type: 'city', countryCode: 'PE', state: 'LM', city: 'Lima', lat: -12.05, lng: -77.04, population: 10000000 },
  { id: 'c-montevideo', name: 'Montevideo', type: 'city', countryCode: 'UY', state: 'MO', city: 'Montevideo', lat: -34.90, lng: -56.16, population: 1700000 },
  { id: 'c-lisboa', name: 'Lisboa', type: 'city', countryCode: 'PT', state: 'Lisboa', city: 'Lisboa', lat: 38.72, lng: -9.14, population: 550000 },
  { id: 'c-porto', name: 'Porto', type: 'city', countryCode: 'PT', state: 'Porto', city: 'Porto', lat: 41.15, lng: -8.61, population: 240000 },
  { id: 'c-madrid', name: 'Madrid', type: 'city', countryCode: 'ES', state: 'Madrid', city: 'Madrid', lat: 40.42, lng: -3.70, population: 3300000 },
  { id: 'c-barcelona', name: 'Barcelona', type: 'city', countryCode: 'ES', state: 'Cataluña', city: 'Barcelona', lat: 41.39, lng: 2.17, population: 1600000 },
  { id: 'c-london', name: 'London', type: 'city', countryCode: 'GB', state: 'England', city: 'London', lat: 51.51, lng: -0.13, population: 9000000 },
  { id: 'c-paris', name: 'Paris', type: 'city', countryCode: 'FR', state: 'Île-de-France', city: 'Paris', lat: 48.86, lng: 2.35, population: 2100000 },
  { id: 'c-berlin', name: 'Berlin', type: 'city', countryCode: 'DE', state: 'Berlin', city: 'Berlin', lat: 52.52, lng: 13.40, population: 3700000 },
  { id: 'c-rome', name: 'Roma', type: 'city', countryCode: 'IT', state: 'Lazio', city: 'Roma', lat: 41.90, lng: 12.50, population: 4300000 },
  { id: 'c-amsterdam', name: 'Amsterdam', type: 'city', countryCode: 'NL', state: 'Noord-Holland', city: 'Amsterdam', lat: 52.37, lng: 4.90, population: 870000 },
  { id: 'c-dublin', name: 'Dublin', type: 'city', countryCode: 'IE', state: 'Leinster', city: 'Dublin', lat: 53.35, lng: -6.26, population: 590000 },
  // Asia / Oceania
  { id: 'c-tokyo', name: 'Tokyo', type: 'city', countryCode: 'JP', state: 'Tokyo', city: 'Tokyo', lat: 35.68, lng: 139.69, population: 14000000 },
  { id: 'c-singapore', name: 'Singapore', type: 'city', countryCode: 'SG', city: 'Singapore', lat: 1.35, lng: 103.82, population: 5900000 },
  { id: 'c-dubai', name: 'Dubai', type: 'city', countryCode: 'AE', state: 'Dubai', city: 'Dubai', lat: 25.20, lng: 55.27, population: 3600000 },
  { id: 'c-sydney', name: 'Sydney', type: 'city', countryCode: 'AU', state: 'NSW', city: 'Sydney', lat: -33.87, lng: 151.21, population: 5300000 },
  { id: 'c-auckland', name: 'Auckland', type: 'city', countryCode: 'NZ', state: 'Auckland', city: 'Auckland', lat: -36.85, lng: 174.76, population: 1700000 },
  { id: 'c-jakarta', name: 'Jakarta', type: 'city', countryCode: 'ID', state: 'DKI Jakarta', city: 'Jakarta', lat: -6.21, lng: 106.85, population: 11000000 },
  { id: 'c-seoul', name: 'Seoul', type: 'city', countryCode: 'KR', state: 'Seoul', city: 'Seoul', lat: 37.57, lng: 126.98, population: 9700000 },
  { id: 'c-istanbul', name: 'Istanbul', type: 'city', countryCode: 'TR', state: 'Istanbul', city: 'Istanbul', lat: 41.01, lng: 28.98, population: 15500000 },
];
