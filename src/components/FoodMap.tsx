
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface FoodMapProps {
  items: FoodItem[];
  userLocation: {lat: number; lng: number} | null;
  onItemClick: (item: FoodItem) => void;
}

export const FoodMap: React.FC<FoodMapProps> = ({ items, userLocation, onItemClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [nearbyItems, setNearbyItems] = useState<FoodItem[]>([]);

  // Filter items within 10km radius when userLocation or items change
  useEffect(() => {
    if (userLocation && items.length > 0) {
      const nearby = items.filter(item => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          item.location.lat,
          item.location.lng
        );
        return distance <= 10; // 10km radius
      });
      
      setNearbyItems(nearby);
      toast.success(`Found ${nearby.length} food items within 10km`);
    } else {
      setNearbyItems(items);
    }
  }, [items, userLocation]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !userLocation || !mapboxToken) return;

    const mapCenter: [number, number] = [userLocation.lng, userLocation.lat];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: mapCenter,
      zoom: 12,
      accessToken: mapboxToken
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add user location marker
    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat(mapCenter)
      .setPopup(new mapboxgl.Popup().setHTML('<div class="text-center"><strong>Your Location</strong></div>'))
      .addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, [userLocation, mapboxToken]);

  // Add food item markers
  useEffect(() => {
    if (!map.current || !nearbyItems.length) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.food-marker');
    existingMarkers.forEach(marker => marker.remove());

    nearbyItems.forEach((item) => {
      const markerEl = document.createElement('div');
      markerEl.className = 'food-marker';
      markerEl.style.width = '40px';
      markerEl.style.height = '40px';
      markerEl.style.borderRadius = '50%';
      markerEl.style.border = '3px solid white';
      markerEl.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
      markerEl.style.cursor = 'pointer';
      markerEl.style.backgroundImage = `url(${item.image})`;
      markerEl.style.backgroundSize = 'cover';
      markerEl.style.backgroundPosition = 'center';

      const getCategoryColor = (category: string) => {
        const colors = {
          vegetables: '#10b981',
          fruits: '#f97316',
          baked: '#eab308',
          desserts: '#ec4899',
          meals: '#3b82f6'
        };
        return colors[category as keyof typeof colors] || '#6b7280';
      };

      markerEl.style.backgroundColor = getCategoryColor(item.category);

      const expiryInfo = item.expire_date 
        ? `<div class="text-xs text-orange-600 mt-1">Expires: ${new Date(item.expire_date).toLocaleDateString()}</div>`
        : '';

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-3 max-w-xs">
            <img src="${item.image}" alt="${item.title}" class="w-full h-32 object-cover rounded-lg mb-2" />
            <h3 class="font-semibold text-lg mb-1">${item.title}</h3>
            <p class="text-gray-600 text-sm mb-2">${item.description}</p>
            ${expiryInfo}
            <div class="flex items-center justify-between mt-2">
              <span class="text-xs text-gray-500">${item.location.address}</span>
              <span class="text-xs text-gray-500">${item.postedAt}</span>
            </div>
          </div>
        `);

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([item.location.lng, item.location.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markerEl.addEventListener('click', () => {
        setSelectedItem(item);
        onItemClick(item);
      });
    });

    // Fit map to show all markers
    if (nearbyItems.length > 0 && userLocation) {
      const bounds = new mapboxgl.LngLatBounds();
      
      // Add user location to bounds
      bounds.extend([userLocation.lng, userLocation.lat]);
      
      // Add all food item locations to bounds
      nearbyItems.forEach(item => {
        bounds.extend([item.location.lng, item.location.lat]);
      });

      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [nearbyItems, userLocation, onItemClick]);

  const getDirections = (item: FoodItem) => {
    if (!userLocation) {
      toast.error('Location not available');
      return;
    }

    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${item.location.lat},${item.location.lng}`;
    window.open(url, '_blank');
  };

  const handleTokenSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = formData.get('token') as string;
    if (token) {
      setMapboxToken(token);
      localStorage.setItem('mapbox_token', token);
    }
  };

  // Check for saved token
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
    }
  }, []);

  if (!mapboxToken) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
        <Card className="p-6 max-w-md">
          <div className="text-center mb-4">
            <MapPin className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Map Setup Required
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              To display the interactive map, please enter your Mapbox public token. 
              You can get one at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">mapbox.com</a>
            </p>
          </div>
          <form onSubmit={handleTokenSubmit} className="space-y-3">
            <input
              type="text"
              name="token"
              placeholder="Enter your Mapbox token"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <Button type="submit" className="w-full">
              Initialize Map
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      
      {selectedItem && (
        <div className="absolute top-4 left-4 z-10">
          <Card className="p-4 max-w-sm bg-white/95 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <img 
                src={selectedItem.image} 
                alt={selectedItem.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{selectedItem.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{selectedItem.description}</p>
                {selectedItem.expire_date && (
                  <p className="text-xs text-orange-600 mt-1">
                    Expires: {new Date(selectedItem.expire_date).toLocaleDateString()}
                  </p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="text-xs">
                    {selectedItem.category}
                  </Badge>
                  <div className="flex items-center text-gray-500 text-xs">
                    <Heart className="h-3 w-3 mr-1" />
                    {selectedItem.likes}
                  </div>
                </div>
                <div className="flex space-x-2 mt-3">
                  <Button 
                    size="sm" 
                    onClick={() => getDirections(selectedItem)}
                    className="flex items-center space-x-1"
                  >
                    <Navigation className="h-3 w-3" />
                    <span>Directions</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedItem(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-sm text-gray-600">
            📍 {nearbyItems.length} food items nearby
          </p>
          {userLocation && (
            <p className="text-xs text-gray-500 mt-1">
              Within 10km of your location
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
