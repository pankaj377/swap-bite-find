import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, MapPin, List, MessageSquare, Settings } from 'lucide-react';
import { AddFoodModal } from '@/components/AddFoodModal';
import { FoodMap } from '@/components/FoodMap';
import { FoodCard } from '@/components/FoodCard';
import { RequestsManagement } from '@/components/RequestsManagement';
import { useAuth } from '@/contexts/AuthContext';
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

const Dashboard = () => {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [myFoodItems, setMyFoodItems] = useState<FoodItem[]>([]);
  const [nearbyItems, setNearbyItems] = useState<FoodItem[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          toast.error("Failed to get your location. Please ensure location services are enabled.");
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      toast.error("Geolocation is not supported by your browser.");
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadMyFoodItems();
      loadNearbyItems();
    }
  }, [user, userLocation]);

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

      // Get user profiles separately
      const userIds = [...new Set(foodItems.map(item => item.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const itemsWithUsers = foodItems.map(item => {
        const userProfile = profiles?.find(profile => profile.id === item.user_id);
        return {
          ...item,
          user: {
            full_name: userProfile?.full_name || 'Unknown User',
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

  const handleLike = (itemId: string) => {
    console.log('Like item:', itemId);
  };

  const convertToFoodCardFormat = (item: FoodItem) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    image: item.image_url || '/placeholder.svg',
    category: item.category,
    location: {
      lat: item.location_lat,
      lng: item.location_lng,
      address: item.location_address
    },
    user: {
      name: item.user.full_name,
      avatar: item.user.avatar_url || '/placeholder.svg'
    },
    user_id: item.user_id,
    postedAt: new Date(item.created_at).toLocaleDateString(),
    likes: 0,
    isLiked: false
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        <div className="pt-20 flex justify-center items-center h-screen">
          <p className="text-gray-600 dark:text-gray-400">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Share food, reduce waste, build community
              </p>
            </div>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Share Food
            </Button>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="nearby" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="nearby" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Nearby</span>
              </TabsTrigger>
              <TabsTrigger value="my-items" className="flex items-center space-x-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">My Items</span>
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Requests</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Map</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nearby" className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                </div>
              ) : nearbyItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nearbyItems.map(item => (
                    <FoodCard
                      key={item.id}
                      item={convertToFoodCardFormat(item)}
                      onLike={handleLike}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <p className="text-gray-500 dark:text-gray-400">No food items found nearby.</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="my-items" className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                </div>
              ) : myFoodItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myFoodItems.map(item => (
                    <FoodCard
                      key={item.id}
                      item={convertToFoodCardFormat(item)}
                      onLike={handleLike}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <p className="text-gray-500 dark:text-gray-400">You haven't shared any food items yet.</p>
                  <Button 
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white"
                  >
                    Share Your First Item
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="requests" className="space-y-6">
              <RequestsManagement />
            </TabsContent>

            <TabsContent value="map" className="space-y-6">
              <Card className="overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <div className="h-96">
                  <FoodMap 
                    items={nearbyItems.map(convertToFoodCardFormat)}
                    userLocation={userLocation}
                    onItemClick={(item) => console.log('Item clicked:', item)}
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AddFoodModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onFoodAdded={() => {
          loadMyFoodItems();
          loadNearbyItems();
        }}
      />
    </div>
  );
};

export default Dashboard;
