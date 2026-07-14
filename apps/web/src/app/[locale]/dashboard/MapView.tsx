'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Standalone Leaflet map component that avoids SSR issues.
 * Uses imperative Leaflet API instead of react-leaflet for reliability.
 */
export default function MapView({
  onError,
}: {
  onError?: (msg: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    try {
      const map = L.map(containerRef.current, {
        center: [-3.7319, -38.5267], // Fortaleza
        zoom: 12,
        zoomControl: false, // cleaner full-screen look
        attributionControl: false, // hide attribution
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Optional: add a marker at Fortaleza city center
      L.marker([-3.7319, -38.5267])
        .addTo(map)
        .bindPopup('Fortaleza');

      mapRef.current = map;

      // Invalidate size after mount to fix rendering
      setTimeout(() => map.invalidateSize(), 100);
    } catch (err) {
      onError?.(
        err instanceof Error ? err.message : 'Erro ao inicializar o mapa',
      );
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onError]);

  return <div ref={containerRef} className="h-full w-full" />;
}
