
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

// Mock data for food listings
const mockFoodItems = [
  {
    id: '1',
    title: 'Fresh Tomatoes',
    description: 'Organic tomatoes from my garden, perfect for salads',
    image: 'https://images.unsplash.com/photo-1546470427-e75e37c79c2b?w=400&h=300&fit=crop',
    category: 'vegetables',
    location: { lat: 40.7128, lng: -74.0060, address: '0.2 miles away' },
    user: { name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c719?w=32&h=32&fit=crop&crop=face' },
    postedAt: '2 hours ago',
    likes: 12,
    isLiked: false
  },
  {
    id: '2',
    title: 'Homemade Bread',
    description: 'Freshly baked sourdough bread, still warm',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    category: 'baked',
    location: { lat: 40.7589, lng: -73.9851, address: '0.5 miles away' },
    user: { name: 'Mike', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
    postedAt: '4 hours ago',
    likes: 8,
    isLiked: true
  },
  {
    id: '3',
    title: 'Apple Pie',
    description: 'Homemade apple pie, perfect for dessert',
    image: 'https://images.unsplash.com/photo-1535920527002-b35e96722da9?w=400&h=300&fit=crop',
    category: 'desserts',
    location: { lat: 40.7589, lng: -73.9851, address: '0.8 miles away' },
    user: { name: 'Emma', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face' },
    postedAt: '1 day ago',
    likes: 15,
    isLiked: false
  }
];

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [foodItems, setFoodItems] = useState(mockFoodItems);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

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
          ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 }
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
            
            <Button className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg">
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

          {/* Content */}
          {viewMode === 'map' ? (
            <div className="h-[600px] rounded-2xl overflow-hidden shadow-lg">
              <FoodMap items={filteredItems} />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <FoodCard
                  key={item.id}
                  item={item}
                  onLike={handleLike}
                />
              ))}
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">No food items found</div>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
