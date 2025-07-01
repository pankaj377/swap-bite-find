
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { createMarkerIcon, createPopupContent } from '@/utils/mapUtils';

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

interface MapMarkersProps {
  map: L.Map | null;
  items: FoodItem[];
  userLocation: {lat: number; lng: number} | null;
  onItemClick: (item: FoodItem) => void;
}

export const MapMarkers: React.FC<MapMarkersProps> = ({
  map,
  items,
  userLocation,
  onItemClick
}) => {
  const markersRef = useRef<L.Marker[]>([]);

  // Handle directions to food item
  const handleGetDirections = (item: FoodItem) => {
    if (!userLocation) {
      console.warn('User location not available for directions');
      return;
    }

    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${item.location.lat},${item.location.lng}`;
    console.log('Opening directions:', url);
    window.open(url, '_blank');
  };

  useEffect(() => {
    if (!map || !items || items.length === 0) {
      console.log('Map not ready or no items to display');
      return;
    }

    console.log('Adding food markers:', items.length);

    try {
      // Clear existing food markers
      markersRef.current.forEach(marker => {
        map.removeLayer(marker);
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
        }).addTo(map);

        // Create popup content with enhanced mobile support
        const popupContent = createPopupContent(item, () => handleGetDirections(item));
        
        // Bind popup with optimized settings for proper positioning
        marker.bindPopup(popupContent, {
          maxWidth: 300,
          minWidth: 280,
          className: 'food-popup mobile-optimized-popup',
          closeButton: true,
          autoPan: true,
          autoPanPadding: [20, 20],
          keepInView: true,
          closeOnClick: false,
          offset: [0, -10], // Offset to position popup above marker
          autoPanPaddingBottomRight: [20, 20],
          autoPanPaddingTopLeft: [20, 20]
        });
        
        // Enhanced event handling for mobile and desktop
        marker.on('click', (e: L.LeafletMouseEvent) => {
          console.log('Marker clicked:', item.title);
          
          // Ensure popup opens properly positioned
          setTimeout(() => {
            marker.openPopup();
          }, 50);
          
          onItemClick(item);
          
          // Prevent event bubbling
          if (e.originalEvent) {
            e.originalEvent.stopPropagation();
          }
        });

        // Additional mobile touch support
        marker.on('touchstart', () => {
          console.log('Marker touched:', item.title);
          setTimeout(() => {
            marker.openPopup();
          }, 100);
        });

        // Handle popup open events with proper positioning
        marker.on('popupopen', (e) => {
          console.log('Popup opened for:', item.title);
          
          // Ensure popup is properly positioned within map bounds
          const popup = e.popup;
          if (popup) {
            setTimeout(() => {
              map.panIntoView(popup.getLatLng(), {
                paddingTopLeft: [20, 20],
                paddingBottomRight: [20, 20]
              });
            }, 100);
          }
          
          // Setup directions button click handler
          const directionsBtn = document.querySelector(`#directions-btn-${item.id}`);
          if (directionsBtn) {
            directionsBtn.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              handleGetDirections(item);
            });
          }
        });

        markersRef.current.push(marker);
      });

      // Fit map to show all markers including user location
      if (items.length > 0 && userLocation) {
        setTimeout(() => {
          try {
            const bounds = L.latLngBounds([]);
            
            bounds.extend([userLocation.lat, userLocation.lng]);
            
            items.forEach(item => {
              if (item.location && !isNaN(item.location.lat) && !isNaN(item.location.lng)) {
                bounds.extend([item.location.lat, item.location.lng]);
              }
            });
            
            map.fitBounds(bounds, {
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

    return () => {
      markersRef.current.forEach(marker => {
        if (map) {
          map.removeLayer(marker);
        }
      });
      markersRef.current = [];
    };
  }, [map, items, onItemClick, userLocation]);

  return null;
};
