
import { useEffect, RefObject } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapInitializerProps {
  mapContainer: RefObject<HTMLDivElement>;
  userLocation: {lat: number; lng: number} | null;
  onMapReady: (map: L.Map) => void;
}

export const MapInitializer: React.FC<MapInitializerProps> = ({
  mapContainer,
  userLocation,
  onMapReady
}) => {
  useEffect(() => {
    if (!mapContainer.current || !userLocation) return;

    // Check if map is already initialized
    if (mapContainer.current._leaflet_id) {
      console.log('Map container already has a map, skipping initialization');
      return;
    }

    console.log('Initializing Leaflet map with user location:', userLocation);

    try {
      // Initialize Leaflet map with mobile-optimized settings
      const map = L.map(mapContainer.current, {
        touchZoom: true,
        dragging: true,
        zoomControl: true,
        scrollWheelZoom: false,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true
      }).setView([userLocation.lat, userLocation.lng], 13);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      console.log('Leaflet map initialized successfully');
      onMapReady(map);

    } catch (error) {
      console.error('Error initializing Leaflet map:', error);
    }
  }, [mapContainer, userLocation, onMapReady]);

  return null;
};
