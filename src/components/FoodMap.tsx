
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MapTokenSetup } from '@/components/map/MapTokenSetup';
import { MapContainer } from '@/components/map/MapContainer';
import { MapItemInfo } from '@/components/map/MapItemInfo';
import { MapStats } from '@/components/map/MapStats';
import { calculateDistance } from '@/utils/mapUtils';

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

  const getDirections = (item: FoodItem) => {
    if (!userLocation) {
      toast.error('Location not available');
      return;
    }

    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${item.location.lat},${item.location.lng}`;
    window.open(url, '_blank');
  };

  const handleTokenSubmit = (token: string) => {
    setMapboxToken(token);
    localStorage.setItem('mapbox_token', token);
  };

  const handleItemClick = (item: FoodItem) => {
    setSelectedItem(item);
    onItemClick(item);
  };

  // Check for saved token
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
    }
  }, []);

  if (!mapboxToken) {
    return <MapTokenSetup onTokenSubmit={handleTokenSubmit} />;
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <MapContainer
        items={nearbyItems}
        userLocation={userLocation}
        mapboxToken={mapboxToken}
        onItemClick={handleItemClick}
      />
      
      {selectedItem && (
        <MapItemInfo
          selectedItem={selectedItem}
          userLocation={userLocation}
          onClose={() => setSelectedItem(null)}
          onGetDirections={getDirections}
        />
      )}

      <MapStats
        itemsCount={nearbyItems.length}
        userLocation={userLocation}
      />
    </div>
  );
};
