
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
      // Join food_items with profiles table to get user information
      const { data: foodItems, error } = await supabase
        .from('food_items')
        .select(`
          *,
          profiles!inner (
            full_name,
            avatar_url
          )
        `)
        .neq('user_id', user.id);

      if (error) throw error;

      if (!foodItems || foodItems.length === 0) {
        setNearbyItems([]);
        setLoading(false);
        return;
      }

      // Transform the data to match our expected format
      const itemsWithUsers = foodItems.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        image_url: item.image_url,
        category: item.category,
        location_lat: item.location_lat,
        location_lng: item.location_lng,
        location_address: item.location_address,
        user_id: item.user_id,
        created_at: item.created_at,
        expire_date: item.expire_date,
        user: {
          full_name: item.profiles?.full_name || 'Food Sharer',
          avatar_url: item.profiles?.avatar_url || ''
        }
      }));

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
