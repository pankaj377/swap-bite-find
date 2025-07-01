
import React, { useRef, useState } from 'react';
import L from 'leaflet';
import { MapInitializer } from './MapInitializer';
import { MapUserLocation } from './MapUserLocation';
import { MapMarkers } from './MapMarkers';
import { MapStyles } from './MapStyles';

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
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const handleMapReady = (mapInstance: L.Map) => {
    setMap(mapInstance);
    setMapReady(true);
  };

  // Cleanup map on unmount
  React.useEffect(() => {
    return () => {
      if (map) {
        map.remove();
        setMap(null);
        setMapReady(false);
      }
    };
  }, [map]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      <MapInitializer
        mapContainer={mapContainer}
        userLocation={userLocation}
        onMapReady={handleMapReady}
      />
      
      <MapUserLocation
        map={map}
        userLocation={userLocation}
      />
      
      <MapMarkers
        map={map}
        items={items}
        userLocation={userLocation}
        onItemClick={onItemClick}
      />
      
      <MapStyles />
      
      {/* Loading indicator */}
      {!mapReady && userLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Initializing map...</p>
          </div>
        </div>
      )}
      
      {/* No items indicator */}
      {(!items || items.length === 0) && userLocation && mapReady && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">No food items found in your area</p>
        </div>
      )}

      {/* Map Provider Info */}
      <div className="absolute top-4 right-4 bg-green-50/90 backdrop-blur-sm p-2 rounded-lg shadow-md">
        <p className="text-xs text-green-600">Leaflet + OpenStreetMap</p>
      </div>
    </div>
  );
};
