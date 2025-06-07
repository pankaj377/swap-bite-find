
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle } from 'lucide-react';

interface FoodCardActionsProps {
  likes: number;
  isLiked: boolean;
  isOwnItem: boolean;
  onLike: () => void;
  onChat: () => void;
  onRequest: () => void;
}

export const FoodCardActions: React.FC<FoodCardActionsProps> = ({
  likes,
  isLiked,
  isOwnItem,
  onLike,
  onChat,
  onRequest
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onLike}
          className={`flex items-center space-x-1 text-sm transition-colors ${
            isLiked 
              ? 'text-red-500' 
              : 'text-gray-500 hover:text-red-500 dark:text-gray-400'
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likes}</span>
        </button>
        {!isOwnItem && (
          <button 
            onClick={onChat}
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
          onClick={onRequest}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
        >
          Request
        </Button>
      )}
    </div>
  );
};
