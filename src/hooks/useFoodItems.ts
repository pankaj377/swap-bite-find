
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface User {
  id: string;
  name?: string;
  avatar?: string;
}

export const useFoodItems = (user: User | null, userLocation: {lat: number; lng: number} | null) => {
  const [myFoodItems, setMyFoodItems] = useState<FoodItem[]>([]);
  const [nearbyItems, setNearbyItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMyFoodItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // For my own items, we don't need to fetch user profile since it's the current user
      const itemsWithUser = (data || []).map(item => ({
        ...item,
        user: {
          full_name: user.name || 'You',
          avatar_url: user.avatar || ''
        }
      }));
      
      setMyFoodItems(itemsWithUser);
    } catch (error: any) {
      console.error('Error loading my food items:', error);
      toast.error('Failed to load your food items');
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyItems = async () => {
    if (!user || !userLocation) return;

    try {
      // First get all food items except user's own items
      const { data: foodItems, error } = await supabase
        .from('food_items')
        .select('*')
        .neq('user_id', user.id);

      if (error) throw error;

      if (!foodItems || foodItems.length === 0) {
        setNearbyItems([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs from food items
      const userIds = [...new Set(foodItems.map(item => item.user_id))];
      
      // Fetch user profiles for those IDs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without profiles data
      }

      // Combine food items with user profiles
      const itemsWithUsers = foodItems.map(item => {
        const userProfile = profiles?.find(profile => profile.id === item.user_id);
        return {
          ...item,
          user: {
            full_name: userProfile?.full_name || 'Food Sharer',
            avatar_url: userProfile?.avatar_url || ''
          }
        };
      });

      setNearbyItems(itemsWithUsers);
    } catch (error: any) {
      console.error('Error loading nearby food items:', error);
      toast.error('Failed to load nearby food items');
    } finally {
      setLoading(false);
    }
  };

  const refreshItems = () => {
    loadMyFoodItems();
    loadNearbyItems();
  };

  useEffect(() => {
    if (user) {
      loadMyFoodItems();
      loadNearbyItems();
    }
  }, [user, userLocation]);

  return {
    myFoodItems,
    nearbyItems,
    loading,
    refreshItems
  };
};
