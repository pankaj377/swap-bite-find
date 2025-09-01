import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { getCategoryColor, createPopupContent } from '@/utils/mapUtils';

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

interface MapboxMarkersProps {
  map: mapboxgl.Map;
  items: FoodItem[];
  userLocation: {lat: number; lng: number} | null;
  onItemClick: (item: FoodItem) => void;
}

export const MapboxMarkers: React.FC<MapboxMarkersProps> = ({
  map,
  items,
  userLocation,
  onItemClick
}) => {
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Clear user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    try {
      // Add user location marker if available
      if (userLocation) {
        const userMarkerElement = document.createElement('div');
        userMarkerElement.className = 'user-location-marker';
        userMarkerElement.innerHTML = `
          <div style="
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 4px solid #3b82f6;
            background-color: white;
            position: relative;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            cursor: pointer;
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
        `;

        userMarkerRef.current = new mapboxgl.Marker(userMarkerElement)
          .setLngLat([userLocation.lng, userLocation.lat])
          .setPopup(new mapboxgl.Popup().setHTML('<div style="padding: 10px; font-weight: 600;">Your Location</div>'))
          .addTo(map);

        console.log('User marker added successfully');
      }

      // Add food item markers
      items.forEach((item) => {
        if (!item.location || 
            typeof item.location.lat !== 'number' || 
            typeof item.location.lng !== 'number' ||
            isNaN(item.location.lat) || 
            isNaN(item.location.lng)) {
          console.warn('Invalid location data for item:', item.id);
          return;
        }

        const color = getCategoryColor(item.category);
        
        // Create custom marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'food-marker';
        markerElement.innerHTML = `
          <div style="
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            cursor: pointer;
            background-image: url(${item.image});
            background-size: cover;
            background-position: center;
            background-color: ${color};
            position: relative;
            transition: transform 0.2s ease;
          ">
            <div style="
              position: absolute;
              bottom: -2px;
              right: -2px;
              width: 16px;
              height: 16px;
              background-color: ${color};
              border: 2px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              color: white;
              font-weight: bold;
            ">
              ${item.category === 'vegetables' ? '🥬' : 
                item.category === 'fruits' ? '🍎' : 
                item.category === 'baked' ? '🍞' : 
                item.category === 'desserts' ? '🧁' : 
                item.category === 'meals' ? '🍽️' : 
                item.category === 'dairy' ? '🥛' : 
                item.category === 'snacks' ? '🍿' : 
                item.category === 'beverages' ? '🥤' : '🍴'}
            </div>
          </div>
        `;

        // Add hover effects
        markerElement.addEventListener('mouseenter', () => {
          markerElement.style.transform = 'scale(1.1)';
        });
        
        markerElement.addEventListener('mouseleave', () => {
          markerElement.style.transform = 'scale(1)';
        });

        // Create popup
        const popupContent = createPopupContent(item);
        const popup = new mapboxgl.Popup({ 
          offset: 25,
          closeButton: true,
          closeOnClick: true,
          maxWidth: '300px'
        }).setHTML(popupContent);

        // Create and add marker
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([item.location.lng, item.location.lat])
          .setPopup(popup)
          .addTo(map);

        // Handle marker click
        markerElement.addEventListener('click', () => {
          console.log('Food item clicked on map:', item.title);
          onItemClick(item);
        });

        markersRef.current.push(marker);
      });

      // Fit map to show all markers (with or without user location)
      if (items.length > 0) {
        setTimeout(() => {
          try {
            const bounds = new mapboxgl.LngLatBounds();
            
            // Add user location to bounds if available
            if (userLocation) {
              bounds.extend([userLocation.lng, userLocation.lat]);
            }
            
            // Add all food item locations to bounds
            items.forEach(item => {
              if (item.location && !isNaN(item.location.lat) && !isNaN(item.location.lng)) {
                bounds.extend([item.location.lng, item.location.lat]);
              }
            });
            
            // Only fit bounds if we have valid bounds
            if (!bounds.isEmpty()) {
              map.fitBounds(bounds, {
                padding: 50,
                maxZoom: userLocation ? 15 : 10
              });
            }
          } catch (error) {
            console.error('Error fitting bounds:', error);
          }
        }, 500);
      }

      console.log(`Successfully added ${markersRef.current.length} food markers to Mapbox map`);
    } catch (error) {
      console.error('Error adding markers to Mapbox map:', error);
    }

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    };
  }, [map, items, userLocation, onItemClick]);

  return null;
};