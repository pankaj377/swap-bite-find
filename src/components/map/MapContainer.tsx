import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  expireDate?: string;
  expire_date?: string;
}

interface MapContainerProps {
  items: FoodItem[];
  userLocation: { lat: number; lng: number } | null;
  onItemClick: (item: FoodItem) => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  items,
  userLocation,
  onItemClick,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
    });

    mapRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Set initial view
    const defaultCenter: [number, number] = userLocation 
      ? [userLocation.lat, userLocation.lng] 
      : [23.2599, 77.4126]; // Bhopal, India
    
    map.setView(defaultCenter, userLocation ? 13 : 5);

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [userLocation]);

  // Update markers when items change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Filter out expired items before displaying
    const now = new Date();
    const validItems = items.filter(item => {
      if (!item.expireDate && !item.expire_date) return true; // No expiry date
      
      const expireDate = item.expireDate || item.expire_date;
      const itemExpiry = new Date(expireDate);
      
      return itemExpiry > now; // Only show non-expired items
    });

    // Add user location marker
    if (userLocation && mapRef.current) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="
            background: #3b82f6;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
      }).addTo(mapRef.current);

      userMarker.bindPopup(`
        <div class="p-2">
          <strong>Your Location</strong>
        </div>
      `);

      markersRef.current.push(userMarker);
    }

    // Add food item markers (only valid non-expired items)
    validItems.forEach(item => {
      if (!item.location || !mapRef.current) return;

      const foodIcon = L.divIcon({
        className: 'food-marker',
        html: `
          <div style="
            background: #10b981;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
          ">🍽️</div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([item.location.lat, item.location.lng], {
        icon: foodIcon,
      }).addTo(mapRef.current);

      // Create popup content
      const popupContent = `
        <div class="food-popup" style="min-width: 250px; max-width: 300px;">
          <div style="position: relative; margin-bottom: 12px;">
            <img 
              src="${item.image}" 
              alt="${item.title}"
              style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;"
            />
            <div style="position: absolute; top: 8px; left: 8px;">
              <span style="
                background: #10b981;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
              ">${item.category}</span>
            </div>
          </div>
          
          <div style="padding: 0 4px;">
            <h3 style="
              font-size: 16px;
              font-weight: 600;
              margin: 0 0 8px 0;
              color: #1f2937;
            ">${item.title}</h3>
            
            <p style="
              font-size: 14px;
              color: #6b7280;
              margin: 0 0 12px 0;
              line-height: 1.4;
            ">${item.description}</p>
            
            <div style="
              display: flex;
              align-items: center;
              margin-bottom: 12px;
              padding: 8px;
              background: #f3f4f6;
              border-radius: 6px;
            ">
              <img 
                src="${item.user.avatar}" 
                alt="${item.user.name}"
                style="
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  margin-right: 8px;
                  object-fit: cover;
                "
              />
              <div>
                <div style="font-size: 12px; font-weight: 500; color: #374151;">
                  ${item.user.name}
                </div>
                <div style="font-size: 11px; color: #9ca3af;">
                  ${item.postedAt}
                </div>
              </div>
            </div>
            
            ${item.expireDate ? `
              <div style="
                font-size: 12px;
                color: #ef4444;
                margin-bottom: 12px;
                padding: 4px 8px;
                background: #fef2f2;
                border-radius: 4px;
                border: 1px solid #fecaca;
              ">
                ⏰ Expires: ${new Date(item.expireDate).toLocaleDateString()}
              </div>
            ` : ''}
            
            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <button 
                onclick="window.foodMapActions?.viewItem('${item.id}')"
                style="
                  flex: 1;
                  background: #3b82f6;
                  color: white;
                  border: none;
                  padding: 8px 12px;
                  border-radius: 6px;
                  font-size: 12px;
                  font-weight: 500;
                  cursor: pointer;
                "
              >
                View Details
              </button>
              ${userLocation ? `
                <button 
                  onclick="window.foodMapActions?.getDirections('${item.location.lat}', '${item.location.lng}')"
                  style="
                    flex: 1;
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                  "
                >
                  Directions
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup',
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers if valid items exist
    if (validItems.length > 0 && mapRef.current) {
      const group = new L.FeatureGroup(markersRef.current);
      const bounds = group.getBounds();
      
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 15,
        });
      }
    }

    // Setup global actions for popup buttons
    (window as any).foodMapActions = {
      viewItem: (itemId: string) => {
        const item = validItems.find(i => i.id === itemId);
        if (item) {
          onItemClick(item);
        }
      },
      getDirections: (lat: string, lng: string) => {
        if (userLocation) {
          const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}`;
          window.open(url, '_blank');
        }
      },
    };

  }, [items, userLocation, onItemClick]);

  useEffect(() => {
    // Add custom styles for leaflet popups
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-popup-content-wrapper {
        border-radius: 8px !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
      }
      .leaflet-popup-tip {
        background: white !important;
      }
      .custom-popup .leaflet-popup-content {
        margin: 0 !important;
        padding: 12px !important;
      }
      .food-popup button:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
    </div>
  );
};