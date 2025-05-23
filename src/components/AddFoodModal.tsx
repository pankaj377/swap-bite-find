
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AddFoodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFoodAdded: () => void;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({ 
  open, 
  onOpenChange,
  onFoodAdded 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [foodData, setFoodData] = useState({
    title: '',
    description: '',
    category: 'vegetables',
    image_url: 'https://images.unsplash.com/photo-1546470427-e75e37c79c2b?w=400&h=300&fit=crop',
    location_lat: 40.7128,
    location_lng: -74.0060,
    location_address: 'Near your location',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFoodData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFoodData(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to share food");
      return;
    }

    if (!foodData.title || !foodData.description || !foodData.category) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setLoading(true);

    try {
      // Mock location data for now - in a real app, we would use browser geolocation
      // or a map picker component to get the actual coordinates

      const { error } = await supabase.from('food_items').insert({
        user_id: user.id,
        title: foodData.title,
        description: foodData.description,
        category: foodData.category,
        image_url: foodData.image_url,
        location_lat: foodData.location_lat,
        location_lng: foodData.location_lng,
        location_address: foodData.location_address,
      });

      if (error) {
        throw error;
      }

      toast.success("Food item shared successfully!");
      onFoodAdded();
      onOpenChange(false);
      setFoodData({
        title: '',
        description: '',
        category: 'vegetables',
        image_url: 'https://images.unsplash.com/photo-1546470427-e75e37c79c2b?w=400&h=300&fit=crop',
        location_lat: 40.7128,
        location_lng: -74.0060,
        location_address: 'Near your location',
      });
    } catch (error: any) {
      console.error("Error sharing food item:", error);
      toast.error(error.message || "Failed to share food item");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'vegetables', name: 'Vegetables', color: 'bg-green-100 text-green-800' },
    { id: 'fruits', name: 'Fruits', color: 'bg-orange-100 text-orange-800' },
    { id: 'baked', name: 'Baked Goods', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'desserts', name: 'Desserts', color: 'bg-pink-100 text-pink-800' },
    { id: 'meals', name: 'Meals', color: 'bg-blue-100 text-blue-800' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Food Item</DialogTitle>
          <DialogDescription>
            Share excess food with your neighbors and reduce waste
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Food Title *
            </label>
            <Input
              id="title"
              name="title"
              placeholder="E.g., Fresh Tomatoes"
              value={foodData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description *
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the food item, quantity, freshness, etc."
              value={foodData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category *
            </label>
            <Select 
              value={foodData.category} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="location_address" className="text-sm font-medium">
              Location
            </label>
            <Input
              id="location_address"
              name="location_address"
              placeholder="Your approximate location"
              value={foodData.location_address}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500">
              For privacy reasons, only an approximate location is shown to others
            </p>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sharing...' : 'Share Food'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
