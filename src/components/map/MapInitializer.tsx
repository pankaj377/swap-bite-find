
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
    if (!mapContainer.current) return;

    // Check if map is already initialized using proper type casting
    if ((mapContainer.current as any)._leaflet_id) {
      console.log('Map container already has a map, skipping initialization');
      return;
    }

    // Use user location or default to a central location
    const defaultLocation = { lat: 23.2599, lng: 77.4126 }; // Default to Bhopal, India
    const mapCenter = userLocation || defaultLocation;
    const initialZoom = userLocation ? 13 : 6; // Wider zoom if no user location
    
    console.log('Initializing Leaflet map with center:', mapCenter, 'User location available:', !!userLocation);

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
      }).setView([mapCenter.lat, mapCenter.lng], initialZoom);

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
