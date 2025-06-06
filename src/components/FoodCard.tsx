
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, MapPin, Clock, User, AlertTriangle } from 'lucide-react';
import { RequestFoodModal } from '@/components/RequestFoodModal';
import { ChatModal } from '@/components/ChatModal';
import { useAuth } from '@/contexts/AuthContext';
import { format, isAfter, differenceInHours, differenceInDays } from 'date-fns';

interface FoodItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  location: { lat: number; lng: number; address: string };
  user: { name: string; avatar: string };
  user_id?: string;
  postedAt: string;
  expireDate?: string;
  likes: number;
  isLiked: boolean;
}

interface FoodCardProps {
  item: FoodItem;
  onLike: (itemId: string) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onLike }) => {
  const { user } = useAuth();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

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

  const getExpiryInfo = () => {
    if (!item.expireDate) return null;
    
    const expireDate = new Date(item.expireDate);
    const now = new Date();
    
    // Don't show expired items at all
    if (isAfter(now, expireDate)) {
      return null;
    }
    
    const hoursLeft = differenceInHours(expireDate, now);
    const daysLeft = differenceInDays(expireDate, now);
    const timeString = format(expireDate, 'h:mm a');
    
    if (hoursLeft < 24) {
      return { 
        text: `Expires at ${timeString} (${hoursLeft}h left)`, 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        urgent: true 
      };
    } else if (daysLeft === 1) {
      return { 
        text: `Expires tomorrow at ${timeString}`, 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        urgent: false 
      };
    } else {
      return { 
        text: `Expires in ${daysLeft} days at ${timeString}`, 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        urgent: false 
      };
    }
  };

  // Check if item is expired - if so, don't render the card
  if (item.expireDate) {
    const expireDate = new Date(item.expireDate);
    const now = new Date();
    if (isAfter(now, expireDate)) {
      return null; // Don't render expired items
    }
  }

  const expiryInfo = getExpiryInfo();
  const isOwnItem = user?.id === item.user_id;

  const handleRequestClick = () => {
    if (!user) {
      alert('Please log in to request food items');
      return;
    }
    setShowRequestModal(true);
  };

  const handleChatClick = () => {
    if (!user) {
      alert('Please log in to start a chat');
      return;
    }
    setShowChatModal(true);
  };

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm group">
        <div className="relative">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge className={getCategoryColor(item.category)}>
              {item.category}
            </Badge>
            {expiryInfo && (
              <Badge className={`${expiryInfo.color} border flex items-center gap-1`}>
                {expiryInfo.urgent && <AlertTriangle className="h-3 w-3" />}
                <Clock className="h-3 w-3" />
                {expiryInfo.text}
              </Badge>
            )}
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
          
          {/* Expiry Details - only show if not expired */}
          {item.expireDate && (
            <div className="mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center text-gray-600 dark:text-gray-300 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Expires: {format(new Date(item.expireDate), 'PPp')}
              </div>
            </div>
          )}
          
          {/* Food Sharer Info - Made more prominent */}
          <div className="flex items-center space-x-3 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <img
              src={item.user.avatar || '/placeholder.svg'}
              alt={item.user.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-green-300"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Shared by: {item.user.name}
              </p>
              <div className="flex items-center text-green-600 dark:text-green-400 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {item.postedAt}
              </div>
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
              {!isOwnItem && (
                <button 
                  onClick={handleChatClick}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 dark:text-gray-400 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat</span>
                </button>
              )}
            </div>
            
            {!isOwnItem && (
              <Button 
                size="sm" 
                onClick={handleRequestClick}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
              >
                Request
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Modals */}
      <RequestFoodModal
        open={showRequestModal}
        onOpenChange={setShowRequestModal}
        foodItem={item.user_id ? { id: item.id, title: item.title, user_id: item.user_id } : null}
        onRequestSent={() => {
          console.log('Request sent for item:', item.title);
        }}
      />

      <ChatModal
        open={showChatModal}
        onOpenChange={setShowChatModal}
        otherUserId={item.user_id || ''}
        otherUserName={item.user.name}
      />
    </>
  );
};
