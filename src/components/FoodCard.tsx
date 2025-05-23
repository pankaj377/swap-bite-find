
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, MapPin, Clock, User } from 'lucide-react';

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

interface FoodCardProps {
  item: FoodItem;
  onLike: (itemId: string) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onLike }) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      vegetables: 'bg-green-100 text-green-800',
      fruits: 'bg-orange-100 text-orange-800',
      baked: 'bg-yellow-100 text-yellow-800',
      desserts: 'bg-pink-100 text-pink-800',
      meals: 'bg-blue-100 text-blue-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm group">
      <div className="relative">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge className={getCategoryColor(item.category)}>
            {item.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Button
            size="sm"
            variant="ghost"
            className={`bg-white/90 backdrop-blur-sm hover:bg-white ${
              item.isLiked ? 'text-red-500' : 'text-gray-600'
            }`}
            onClick={() => onLike(item.id)}
          >
            <Heart className={`h-4 w-4 ${item.isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
          {item.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {item.description}
        </p>
        
        {/* User Info */}
        <div className="flex items-center space-x-2 mb-4">
          <img
            src={item.user.avatar}
            alt={item.user.name}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">{item.user.name}</span>
          <div className="flex items-center text-gray-400 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {item.postedAt}
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
          <MapPin className="h-4 w-4 mr-1" />
          {item.location.address}
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onLike(item.id)}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                item.isLiked 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500 dark:text-gray-400'
              }`}
            >
              <Heart className={`h-4 w-4 ${item.isLiked ? 'fill-current' : ''}`} />
              <span>{item.likes}</span>
            </button>
            <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 dark:text-gray-400 transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </button>
          </div>
          
          <Button size="sm" className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700">
            Request
          </Button>
        </div>
      </div>
    </Card>
  );
};
