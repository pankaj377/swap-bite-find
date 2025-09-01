
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MapboxMap } from '@/components/map/MapboxMap';
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
  const [nearbyItems, setNearbyItems] = useState<FoodItem[]>([]);

  // Filter items within 25km radius when userLocation or items change
  useEffect(() => {
    console.log('FoodMap: Processing items', { 
      itemsCount: items.length, 
      userLocation,
      sampleItem: items[0] 
    });

    if (userLocation && items.length > 0) {
      const nearby = items.filter(item => {
        // Validate item location data
        if (!item.location || 
            typeof item.location.lat !== 'number' || 
            typeof item.location.lng !== 'number' ||
            isNaN(item.location.lat) || 
            isNaN(item.location.lng)) {
          console.warn('Invalid location data for item:', item.id, item.location);
          return false;
        }

        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          item.location.lat,
          item.location.lng
        );
        
        console.log(`Distance to ${item.title}: ${distance.toFixed(2)}km`);
        return distance <= 1000; // Increased to 1000km radius to show more items
      });
      
      console.log(`Found ${nearby.length} food items within 1000km`);
      setNearbyItems(nearby);
      
      if (nearby.length > 0) {
        toast.success(`Found ${nearby.length} food items near your location`);
      } else {
        toast.info('No food items found in your area.');
      }
    } else if (userLocation && items.length === 0) {
      console.log('User location available but no items to display');
      setNearbyItems([]);
      toast.info('No food items available in your area yet.');
    } else {
      console.log('No user location or items available');
      setNearbyItems(items); // Show all items if no location
    }
  }, [items, userLocation]);

  const getDirections = (item: FoodItem) => {
    if (!userLocation) {
      toast.error('Your location is not available for directions');
      return;
    }

    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${item.location.lat},${item.location.lng}`;
    window.open(url, '_blank');
    toast.success(`Opening directions to ${item.title}`);
  };

  const handleItemClick = (item: FoodItem) => {
    console.log('Food item clicked on map:', item.title);
    setSelectedItem(item);
    onItemClick(item);
  };

  // Show map even without user location, with appropriate messaging

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      {/* Location status banner */}
      {!userLocation && (
        <div className="absolute top-4 left-4 right-4 z-[1000] bg-blue-50 dark:bg-blue-900/90 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600 dark:text-blue-300">📍</span>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Location not available - showing all food items
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="ml-auto text-blue-600 dark:text-blue-300 text-xs underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      <MapboxMap
        items={nearbyItems}
        userLocation={userLocation}
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
