
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createMarkerIcon, createPopupContent } from '@/utils/mapUtils';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
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
  const [mapReady, setMapReady] = useState(false);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainer.current || !userLocation || mapReady) return;

    console.log('Initializing Leaflet map with user location:', userLocation);

    try {
      // Initialize Leaflet map with mobile-optimized settings
      map.current = L.map(mapContainer.current, {
        touchZoom: true,
        dragging: true,
        zoomControl: true,
        scrollWheelZoom: false
      }).setView([userLocation.lat, userLocation.lng], 13);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.current);

      console.log('Leaflet map initialized successfully');
      setMapReady(true);
      
      // Add user location marker
      addUserMarker();

    } catch (error) {
      console.error('Error initializing Leaflet map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapReady(false);
      }
    };
  }, [userLocation]);

  // Add user location marker
  const addUserMarker = () => {
    if (!map.current || !userLocation) return;

    try {
      // Create custom user location icon
      const userIcon = L.divIcon({
        className: 'user-location-marker',
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
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { 
        icon: userIcon 
      }).addTo(map.current);

      userMarkerRef.current.bindPopup('Your Location');
      console.log('User marker added successfully');
    } catch (error) {
      console.error('Error adding user marker:', error);
    }
  };

  // Add food item markers
  useEffect(() => {
    if (!map.current || !items || items.length === 0 || !mapReady) {
      console.log('Map not ready or no items to display');
      return;
    }

    console.log('Adding food markers:', items.length);

    try {
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

        // Create custom marker icon
        const markerIcon = L.divIcon({
          className: 'food-marker',
          html: createMarkerIcon(item),
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });
        
        const marker = L.marker([item.location.lat, item.location.lng], { 
          icon: markerIcon 
        }).addTo(map.current!);

        // Create and bind popup with mobile-optimized settings
        const popupContent = createPopupContent(item);
        marker.bindPopup(popupContent, {
          maxWidth: 280,
          minWidth: 250,
          className: 'food-popup mobile-popup',
          closeButton: true,
          autoPan: true,
          autoPanPadding: [20, 20],
          keepInView: true
        });
        
        // Add both click and tap events for mobile compatibility
        marker.on('click', (e: L.LeafletMouseEvent) => {
          console.log('Marker clicked:', item.title);
          // Ensure popup opens on mobile
          marker.openPopup();
          onItemClick(item);
          e.originalEvent.stopPropagation();
        });

        // Add touch-specific event for better mobile support
        marker.on('touchstart', () => {
          console.log('Marker touched:', item.title);
          setTimeout(() => {
            marker.openPopup();
          }, 100);
        });

        markersRef.current.push(marker);
      });

      // Fit map to show all markers including user location
      if (items.length > 0 && userLocation) {
        setTimeout(() => {
          try {
            const bounds = L.latLngBounds([]);
            
            // Add user location to bounds
            bounds.extend([userLocation.lat, userLocation.lng]);
            
            // Add all food item locations to bounds
            items.forEach(item => {
              if (item.location && !isNaN(item.location.lat) && !isNaN(item.location.lng)) {
                bounds.extend([item.location.lat, item.location.lng]);
              }
            });
            
            map.current?.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 15
            });
          } catch (error) {
            console.error('Error fitting bounds:', error);
          }
        }, 500);
      }

      console.log(`Successfully added ${markersRef.current.length} food markers to map`);
    } catch (error) {
      console.error('Error adding food markers:', error);
    }
  }, [items, onItemClick, mapReady]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Mobile-specific styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .mobile-popup .leaflet-popup-content {
            margin: 12px 16px !important;
            line-height: 1.4 !important;
            font-size: 14px !important;
          }
          
          .mobile-popup .leaflet-popup-content-wrapper {
            border-radius: 12px !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important;
          }
          
          .mobile-popup .leaflet-popup-tip {
            box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
          }
          
          .food-marker {
            cursor: pointer !important;
            -webkit-tap-highlight-color: transparent !important;
          }
          
          .food-marker:hover {
            transform: scale(1.1) !important;
            transition: transform 0.2s ease !important;
          }
          
          @media (max-width: 768px) {
            .mobile-popup {
              max-width: 90vw !important;
            }
            
            .mobile-popup .leaflet-popup-content {
              max-width: calc(90vw - 32px) !important;
            }
          }
        `
      }} />
      
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
