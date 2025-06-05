
import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, List, MessageCircle, Settings } from 'lucide-react';
import { AddFoodModal } from '@/components/AddFoodModal';
import { RequestsManagement } from '@/components/RequestsManagement';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { NearbyTab } from '@/components/dashboard/NearbyTab';
import { MyItemsTab } from '@/components/dashboard/MyItemsTab';
import { MapTab } from '@/components/dashboard/MapTab';
import { useAuth } from '@/contexts/AuthContext';
import { useFoodItems } from '@/hooks/useFoodItems';
import { useExpiredFoodCleanup } from '@/hooks/useExpiredFoodCleanup';
import { convertToFoodCardFormat } from '@/utils/foodItemUtils';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);

  // Use the cleanup hook to automatically remove expired items
  useExpiredFoodCleanup();

  const { myFoodItems, nearbyItems, loading, refreshItems } = useFoodItems(user, userLocation);

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

  const handleLike = (itemId: string) => {
    console.log('Like item:', itemId);
  };

  const handleAddFood = () => {
    setShowAddModal(true);
  };

  const handleFoodAdded = () => {
    refreshItems();
  };

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
          <DashboardHeader userName={user.name || 'User'} onAddFood={handleAddFood} />

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
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Requests</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Map</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nearby" className="space-y-6">
              <NearbyTab
                items={nearbyItems}
                loading={loading}
                onLike={handleLike}
                convertToFoodCardFormat={convertToFoodCardFormat}
              />
            </TabsContent>

            <TabsContent value="my-items" className="space-y-6">
              <MyItemsTab
                items={myFoodItems}
                loading={loading}
                onLike={handleLike}
                onAddFood={handleAddFood}
                convertToFoodCardFormat={convertToFoodCardFormat}
              />
            </TabsContent>

            <TabsContent value="requests" className="space-y-6">
              <RequestsManagement />
            </TabsContent>

            <TabsContent value="map" className="space-y-6">
              <MapTab
                items={nearbyItems.map(convertToFoodCardFormat)}
                userLocation={userLocation}
                onItemClick={(item) => console.log('Item clicked:', item)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AddFoodModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onFoodAdded={handleFoodAdded}
      />
    </div>
  );
};

export default Dashboard;
