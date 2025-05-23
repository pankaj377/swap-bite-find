
import React from 'react';
import { MapPin } from 'lucide-react';

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
}

interface FoodMapProps {
  items: FoodItem[];
}

export const FoodMap: React.FC<FoodMapProps> = ({ items }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
      <div className="text-center p-8">
        <MapPin className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Interactive Map Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-md">
          We're working on an amazing map view that will show all food items in your area with real-time locations and navigation.
        </p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {items.slice(0, 4).map(item => (
            <div key={item.id} className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">{item.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.location.address}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
