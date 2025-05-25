import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, MapPin, Clock, User, Heart, MessageCircle } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { FoodMap } from '@/components/FoodMap';
import { FoodCard } from '@/components/FoodCard';
import { AddFoodModal } from '@/components/AddFoodModal';
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
  is_available: boolean;
  likes?: number;
  isLiked?: boolean;
  user?: { name: string; avatar: string };
  postedAt?: string;
}

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform data to match our component expectations
      const transformedData = data.map((item: any) => ({
        ...item,
        image: item.image_url,
        likes: Math.floor(Math.random() * 20), // Mock data for likes
        isLiked: false,
        postedAt: formatTimeAgo(new Date(item.created_at)),
        user: {
          name: 'Food Sharer', // We would fetch this from a profiles table in a real app
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        },
        location: {
          lat: item.location_lat,
          lng: item.location_lng,
          address: item.location_address
        }
      }));

      setFoodItems(transformedData);
    } catch (error: any) {
      console.error('Error fetching food items:', error);
      toast.error('Failed to load food items');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + ' year' + (interval === 1 ? '' : 's') + ' ago';
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + ' month' + (interval === 1 ? '' : 's') + ' ago';
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + ' day' + (interval === 1 ? '' : 's') + ' ago';
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + ' hour' + (interval === 1 ? '' : 's') + ' ago';
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + ' minute' + (interval === 1 ? '' : 's') + ' ago';
    
    return Math.floor(seconds) + ' second' + (seconds === 1 ? '' : 's') + ' ago';
  };

  const categories = [
    { id: 'all', name: 'All', color: 'bg-gray-100 text-gray-800' },
    { id: 'vegetables', name: 'Vegetables', color: 'bg-green-100 text-green-800' },
    { id: 'fruits', name: 'Fruits', color: 'bg-orange-100 text-orange-800' },
    { id: 'baked', name: 'Baked Goods', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'desserts', name: 'Desserts', color: 'bg-pink-100 text-pink-800' },
    { id: 'meals', name: 'Meals', color: 'bg-blue-100 text-blue-800' }
  ];

  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLike = (itemId: string) => {
    setFoodItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? (item.likes || 0) - 1 : (item.likes || 0) + 1 }
          : item
      )
    );
  };

  if (showAuthModal && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Food Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Discover and share fresh food in your neighborhood</p>
            </div>
            
            <Button 
              onClick={() => setShowAddFoodModal(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Share Food
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for food items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {categories.map(category => (
                  <Badge
                    key={category.id}
                    className={`cursor-pointer transition-all ${
                      selectedCategory === category.id
                        ? 'bg-green-500 text-white'
                        : category.color
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                >
                  Map
                </Button>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          )}

          {/* Content */}
          {!loading && viewMode === 'map' && (
            <div className="h-[600px] rounded-2xl overflow-hidden shadow-lg">
              <FoodMap items={filteredItems.map(item => ({
                id: item.id,
                title: item.title,
                description: item.description,
                image: item.image_url,
                category: item.category,
                location: {
                  lat: item.location_lat,
                  lng: item.location_lng,
                  address: item.location_address
                },
                user: item.user || {
                  name: 'User',
                  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
                },
                postedAt: item.postedAt || '1 hour ago',
                likes: item.likes || 0,
                isLiked: item.isLiked || false
              }))} />
            </div>
          )}

          {!loading && viewMode === 'grid' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <FoodCard
                  key={item.id}
                  item={{
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    image: item.image_url,
                    category: item.category,
                    location: {
                      lat: item.location_lat,
                      lng: item.location_lng,
                      address: item.location_address
                    },
                    user: item.user || {
                      name: 'User',
                      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
                    },
                    user_id: item.user_id,
                    postedAt: item.postedAt || '1 hour ago',
                    likes: item.likes || 0,
                    isLiked: item.isLiked || false
                  }}
                  onLike={handleLike}
                />
              ))}
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">No food items found</div>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
              {selectedCategory !== 'all' && (
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCategory('all')} 
                  className="mt-4"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Food Modal */}
      <AddFoodModal 
        open={showAddFoodModal} 
        onOpenChange={setShowAddFoodModal} 
        onFoodAdded={fetchFoodItems}
      />
    </div>
  );
};

export default Dashboard;
