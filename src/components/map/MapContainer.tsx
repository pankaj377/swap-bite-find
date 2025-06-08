
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createCustomIcon, createPopupContent } from '@/utils/mapUtils';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  onItemClick: (item: FoodItem) => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({ 
  items, 
  userLocation, 
  onItemClick 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !userLocation) return;

    console.log('Initializing map with user location:', userLocation);

    // Initialize Leaflet map
    map.current = L.map(mapContainer.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map.current);

    // Add user location marker
    const userIcon = L.divIcon({
      html: `
        <div style="
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 4px solid #3b82f6;
          background-color: white;
          position: relative;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        ">
          <div style="
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: #3b82f6;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          "></div>
        </div>
      `,
      className: 'user-location-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map.current)
      .bindPopup('<div class="text-center font-semibold text-blue-600">📍 Your Location</div>');

    console.log('Map initialized successfully');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        userMarkerRef.current = null;
      }
    };
  }, [userLocation]);

  // Add food item markers
  useEffect(() => {
    if (!map.current || !items || items.length === 0) {
      console.log('No map or items to display');
      return;
    }

    console.log('Adding food markers:', items.length);

    // Clear existing food markers
    markersRef.current.forEach(marker => {
      map.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers for each food item
    items.forEach((item, index) => {
      console.log(`Adding marker ${index + 1}:`, item.title, item.location);
      
      // Validate location data
      if (!item.location || 
          typeof item.location.lat !== 'number' || 
          typeof item.location.lng !== 'number' ||
          isNaN(item.location.lat) || 
          isNaN(item.location.lng)) {
        console.warn('Skipping item with invalid location:', item.id);
        return;
      }

      const customIcon = createCustomIcon(item);
      const marker = L.marker([item.location.lat, item.location.lng], { 
        icon: customIcon 
      }).addTo(map.current!);

      // Create and bind popup
      const popupContent = createPopupContent(item);
      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });
      
      // Add click event
      marker.on('click', () => {
        console.log('Marker clicked:', item.title);
        onItemClick(item);
      });

      // Add popup open event
      marker.on('popupopen', () => {
        console.log('Popup opened for:', item.title);
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers including user location
    if (items.length > 0 && userLocation && userMarkerRef.current) {
      const allMarkers = [...markersRef.current, userMarkerRef.current];
      const group = new L.FeatureGroup(allMarkers);
      
      // Set view with padding
      map.current.fitBounds(group.getBounds(), {
        padding: [20, 20],
        maxZoom: 15
      });
    }

    console.log(`Successfully added ${markersRef.current.length} food markers to map`);

  }, [items, onItemClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Loading indicator when no items */}
      {(!items || items.length === 0) && userLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Loading nearby food items...</p>
          </div>
        </div>
      )}
    </div>
  );
};
