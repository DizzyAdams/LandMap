export type Coordinate = {
  lat: number;
  lng: number;
};

export const CITIES: Record<string, Coordinate> = {
  Curitiba: { lat: -25.4284, lng: -49.2733 },
  'Florianópolis': { lat: -27.5954, lng: -48.548 },
  'São Paulo': { lat: -23.5505, lng: -46.6333 },
  Rio: { lat: -22.9068, lng: -43.1729 },
};

export const MAP_TILE_URL = (x: number, y: number, z: number) =>
  `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/${z}/${x}/${y}${process.env.NODE_ENV === 'development' ? '' : ''}.png`;
