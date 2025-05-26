
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createMarkerElement, createPopupContent } from '@/utils/mapUtils';

interface FoodItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  location: { lat: number; lng: number; address: string };
  user: { name: string; avatar: string };
  postedAt: string;
  likes: number;
  isLiked: boolean;
  expire_date?: string;
}

interface MapContainerProps {
  items: FoodItem[];
  userLocation: {lat: number; lng: number} | null;
  mapboxToken: string;
  onItemClick: (item: FoodItem) => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({ 
  items, 
  userLocation, 
  mapboxToken, 
  onItemClick 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !userLocation || !mapboxToken) return;

    const mapCenter: [number, number] = [userLocation.lng, userLocation.lat];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: mapCenter,
      zoom: 12,
      accessToken: mapboxToken
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add user location marker
    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat(mapCenter)
      .setPopup(new mapboxgl.Popup().setHTML('<div class="text-center"><strong>Your Location</strong></div>'))
      .addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, [userLocation, mapboxToken]);

  // Add food item markers
  useEffect(() => {
    if (!map.current || !items.length) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.food-marker');
    existingMarkers.forEach(marker => marker.remove());

    items.forEach((item) => {
      const markerEl = createMarkerElement(item);
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(createPopupContent(item));

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([item.location.lng, item.location.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markerEl.addEventListener('click', () => {
        onItemClick(item);
      });
    });

    // Fit map to show all markers
    if (items.length > 0 && userLocation) {
      const bounds = new mapboxgl.LngLatBounds();
      
      // Add user location to bounds
      bounds.extend([userLocation.lng, userLocation.lat]);
      
      // Add all food item locations to bounds
      items.forEach(item => {
        bounds.extend([item.location.lng, item.location.lat]);
      });

      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [items, userLocation, onItemClick]);

  return <div ref={mapContainer} className="w-full h-full" />;
};
