import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapboxTokenInput } from './MapboxTokenInput';
import { MapboxMarkers } from './MapboxMarkers';
import { toast } from 'sonner';

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

interface MapboxMapProps {
  items: FoodItem[];
  userLocation: {lat: number; lng: number} | null;
  onItemClick: (item: FoodItem) => void;
}

export const MapboxMap: React.FC<MapboxMapProps> = ({ items, userLocation, onItemClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Try to get token from environment or local storage
  useEffect(() => {
    const storedToken = localStorage.getItem('mapbox-token');
    if (storedToken) {
      setMapboxToken(storedToken);
    }
  }, []);

  const handleTokenSubmit = (token: string) => {
    setMapboxToken(token);
    localStorage.setItem('mapbox-token', token);
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      // Use user location or default to a central location
      const defaultLocation = { lat: 23.2599, lng: 77.4126 }; // Bhopal, India
      const mapCenter = userLocation || defaultLocation;
      const initialZoom = userLocation ? 13 : 6;

      console.log('Initializing Mapbox map with center:', mapCenter);

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [mapCenter.lng, mapCenter.lat],
        zoom: initialZoom,
        pitch: 0,
        bearing: 0
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Add scale control
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      map.current.on('load', () => {
        console.log('Mapbox map loaded successfully');
        setMapReady(true);
        toast.success('Map loaded successfully!');
      });

      map.current.on('error', (e) => {
        console.error('Mapbox map error:', e);
        toast.error('Map failed to load. Please check your token.');
      });

    } catch (error) {
      console.error('Error initializing Mapbox map:', error);
      toast.error('Invalid Mapbox token. Please check your token.');
      setMapboxToken(null);
      localStorage.removeItem('mapbox-token');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapReady(false);
      }
    };
  }, [mapboxToken, userLocation]);

  if (!mapboxToken) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <MapboxTokenInput onTokenSubmit={handleTokenSubmit} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Location status banner */}
      {!userLocation && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-blue-50 dark:bg-blue-900/90 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600 dark:text-blue-300">📍</span>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Location not available - showing all food items
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="ml-auto text-blue-600 dark:text-blue-300 text-xs underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div ref={mapContainer} className="w-full h-full rounded-2xl overflow-hidden" />
      
      {mapReady && map.current && (
        <MapboxMarkers
          map={map.current}
          items={items}
          userLocation={userLocation}
          onItemClick={onItemClick}
        />
      )}
    </div>
  );
};