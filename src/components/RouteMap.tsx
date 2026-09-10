'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Location } from '@/types';
import { getCityCoordinates } from '@/lib/geo';

// Вземи токена от environment
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface RouteMapProps {
  origin: Location;
  destination: Location;
}

export function RouteMap({ origin, destination }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return; // вече е инициализирана

    // Провери токена
    if (!mapboxgl.accessToken) {
      console.error('❌ Липсва NEXT_PUBLIC_MAPBOX_TOKEN в .env.local');
      return;
    }

    // Вземи координати
    const originCoords = getCityCoordinates(origin.city);
    const destCoords = getCityCoordinates(destination.city);

    // Ако няма координати – използвай център на Европа
    const center: [number, number] = originCoords || [15, 50];

    // Инициализирай картата
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom: 4,
    });

    // Добави контроли
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Когато картата се зареди
    map.current.on('load', () => {
      if (!map.current) return;

      // Ако имаме и двете точки – начертай маршрут
      if (originCoords && destCoords) {
        // 1. Маркер за начало
        new mapboxgl.Marker({ color: '#22c55e' })
          .setLngLat(originCoords)
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<strong>Начало</strong><br/>${origin.city}, ${origin.country}`
            )
          )
          .addTo(map.current);

        // 2. Маркер за край
        new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat(destCoords)
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<strong>Край</strong><br/>${destination.city}, ${destination.country}`
            )
          )
          .addTo(map.current);

        // 3. Линия между точките (права линия за прототип)
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [originCoords, destCoords],
            },
          },
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 4,
            'line-dasharray': [2, 2],
          },
        });

        // 4. Автоматично центриране да покрие и двете точки
        const bounds = new mapboxgl.LngLatBounds()
          .extend(originCoords)
          .extend(destCoords);

        map.current.fitBounds(bounds, { padding: 80 });
      }
    });

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [origin, destination]);

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="font-semibold text-gray-900">Маршрут на картата</h3>
        <p className="text-sm text-gray-500 mt-1">
          {origin.city} → {destination.city}
        </p>
      </div>
      <div ref={mapContainer} className="w-full h-96" />
    </div>
  );
}