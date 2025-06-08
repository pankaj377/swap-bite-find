
import React, { useEffect, useRef, useState } from 'react';
import { createMarkerIcon, createPopupContent } from '@/utils/mapUtils';
import { MapplsTokenSetup } from './MapplsTokenSetup';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    mappls: any;
    initializeMap: () => void;
  }
}

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
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  // Load Mappls script
  useEffect(() => {
    if (!apiKey) return;

    // Clean up any existing script
    const existingScript = document.querySelector('script[src*="apis.mappls.com"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = `https://apis.mappls.com/advancedmaps/api/${apiKey}/map_sdk?layer=vector&v=3.0&callback=initializeMap`;
    script.async = true;
    
    // Define callback function
    window.initializeMap = () => {
      console.log('Mappls SDK loaded successfully');
      setMapLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load Mappls SDK');
      setMapLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      delete window.initializeMap;
    };
  }, [apiKey]);

  // Initialize map only after script is loaded and user location is available
  useEffect(() => {
    if (!mapContainer.current || !userLocation || !mapLoaded || !window.mappls || mapReady) return;

    console.log('Initializing Mappls map with user location:', userLocation);

    try {
      // Wait a bit to ensure DOM is ready
      setTimeout(() => {
        if (!mapContainer.current) return;

        // Initialize Mappls map
        map.current = new window.mappls.Map(mapContainer.current, {
          center: [userLocation.lat, userLocation.lng],
          zoom: 13,
          zoomControl: true,
          scrollWheel: true,
          disableDoubleClickZoom: false,
          draggable: true
        });

        // Wait for map to be ready
        map.current.on('load', () => {
          console.log('Map loaded and ready');
          setMapReady(true);
          
          // Add user location marker after map is ready
          addUserMarker();
        });

      }, 100);
    } catch (error) {
      console.error('Error initializing Mappls map:', error);
    }

    return () => {
      if (map.current) {
        map.current = null;
        setMapReady(false);
      }
    };
  }, [userLocation, mapLoaded]);

  // Add user location marker
  const addUserMarker = () => {
    if (!map.current || !userLocation || !window.mappls) return;

    try {
      const userMarkerDiv = document.createElement('div');
      userMarkerDiv.innerHTML = `
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
      `;

      userMarkerRef.current = new window.mappls.Marker({
        map: map.current,
        position: [userLocation.lat, userLocation.lng],
        icon: userMarkerDiv,
        title: 'Your Location'
      });

      console.log('User marker added successfully');
    } catch (error) {
      console.error('Error adding user marker:', error);
    }
  };

  // Add food item markers only after map is ready
  useEffect(() => {
    if (!map.current || !items || items.length === 0 || !window.mappls || !mapReady) {
      console.log('Map not ready or no items to display');
      return;
    }

    console.log('Adding food markers:', items.length);

    try {
      // Clear existing food markers
      markersRef.current.forEach(marker => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
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
        const markerDiv = document.createElement('div');
        markerDiv.innerHTML = createMarkerIcon(item);
        
        const marker = new window.mappls.Marker({
          map: map.current,
          position: [item.location.lat, item.location.lng],
          icon: markerDiv,
          title: item.title
        });

        // Create and bind popup
        const popupContent = createPopupContent(item);
        const infoWindow = new window.mappls.InfoWindow({
          content: popupContent,
          maxWidth: 300
        });
        
        // Add click event
        marker.addListener('click', () => {
          console.log('Marker clicked:', item.title);
          infoWindow.open(map.current, marker);
          onItemClick(item);
        });

        markersRef.current.push(marker);
      });

      // Fit map to show all markers including user location
      if (items.length > 0 && userLocation) {
        setTimeout(() => {
          try {
            const bounds = new window.mappls.LatLngBounds();
            
            // Add user location to bounds
            bounds.extend([userLocation.lat, userLocation.lng]);
            
            // Add all food item locations to bounds
            items.forEach(item => {
              if (item.location && !isNaN(item.location.lat) && !isNaN(item.location.lng)) {
                bounds.extend([item.location.lat, item.location.lng]);
              }
            });
            
            map.current.fitBounds(bounds, {
              padding: 50,
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

  // Show token setup if no API key
  if (!apiKey) {
    return <MapplsTokenSetup onTokenSubmit={setApiKey} />;
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Loading indicator */}
      {(!mapLoaded || !mapReady) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">
              {!mapLoaded ? 'Loading Mappls SDK...' : 'Initializing map...'}
            </p>
          </div>
        </div>
      )}
      
      {/* No items indicator */}
      {(!items || items.length === 0) && userLocation && mapReady && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">No food items found in your area</p>
        </div>
      )}
    </div>
  );
};
