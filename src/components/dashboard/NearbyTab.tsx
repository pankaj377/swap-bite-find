
import React from 'react';
import { Card } from '@/components/ui/card';
import { FoodCard } from '@/components/FoodCard';

interface FoodItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  location_lat: number;
  location_lng: number;
  location_address: string;
  user_id: string;
  created_at: string;
  expire_date: string | null;
  user: {
    full_name: string;
    avatar_url: string;
  };
}

interface NearbyTabProps {
  items: FoodItem[];
  loading: boolean;
  onLike: (itemId: string) => void;
  convertToFoodCardFormat: (item: FoodItem) => any;
}

export const NearbyTab: React.FC<NearbyTabProps> = ({ 
  items, 
  loading, 
  onLike, 
  convertToFoodCardFormat 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <p className="text-gray-500 dark:text-gray-400">No food items found nearby.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(item => (
        <FoodCard
          key={item.id}
          item={convertToFoodCardFormat(item)}
          onLike={onLike}
        />
      ))}
    </div>
  );
};
