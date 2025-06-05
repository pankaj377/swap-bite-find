import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocationPicker } from '@/components/LocationPicker';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarDays, Clock } from 'lucide-react';

interface AddFoodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFoodAdded: () => void;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  open,
  onOpenChange,
  onFoodAdded,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: null as File | null,
    location: null as { lat: number; lng: number; address: string } | null,
    expireDate: '',
    expireTime: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setFormData(prev => ({ ...prev, location }));
  };

  const handleImageSelect = (file: File) => {
    setFormData(prev => ({ ...prev, image: file }));
  };

  const handleSameDayExpiry = () => {
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    const endOfDay = '23:59';
    
    setFormData(prev => ({
      ...prev,
      expireDate: todayString,
      expireTime: endOfDay
    }));
    
    toast.success('Set to expire at end of today');
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('food-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('food-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to share food');
      return;
    }

    if (!formData.location) {
      toast.error('Please select a location');
      return;
    }

    if (!formData.expireDate || !formData.expireTime) {
      toast.error('Please set an expiry date and time');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;
      if (formData.image) {
        imageUrl = await uploadImage(formData.image);
        if (!imageUrl) {
          setLoading(false);
          return;
        }
      }

      const expireDateTime = new Date(`${formData.expireDate}T${formData.expireTime}`);

      const { error } = await supabase
        .from('food_items')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          image_url: imageUrl,
          location_lat: formData.location.lat,
          location_lng: formData.location.lng,
          location_address: formData.location.address,
          user_id: user.id,
          expire_date: expireDateTime.toISOString()
        });

      if (error) throw error;

      toast.success('Food item shared successfully!');
      setFormData({
        title: '',
        description: '',
        category: '',
        image: null,
        location: null,
        expireDate: '',
        expireTime: ''
      });
      onFoodAdded();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sharing food:', error);
      toast.error('Failed to share food item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Food with Community</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Food Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="What food are you sharing?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the food item..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vegetables">Vegetables</SelectItem>
                <SelectItem value="fruits">Fruits</SelectItem>
                <SelectItem value="baked">Baked Goods</SelectItem>
                <SelectItem value="desserts">Desserts</SelectItem>
                <SelectItem value="meals">Prepared Meals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Food Photo</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageSelect(file);
              }}
            />
          </div>
          
          {/* Expiry Date and Time Section */}
          <div className="space-y-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <Label className="text-orange-800 dark:text-orange-300 font-medium">
                Expiry Date & Time *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSameDayExpiry}
                className="text-orange-600 border-orange-300 hover:bg-orange-100"
              >
                <CalendarDays className="h-4 w-4 mr-1" />
                Same Day
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="expireDate" className="text-sm">Date</Label>
                <Input
                  id="expireDate"
                  type="date"
                  value={formData.expireDate}
                  onChange={(e) => handleInputChange('expireDate', e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expireTime" className="text-sm">Time</Label>
                <Input
                  id="expireTime"
                  type="time"
                  value={formData.expireTime}
                  onChange={(e) => handleInputChange('expireTime', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <p className="text-xs text-orange-600 dark:text-orange-400">
              <Clock className="h-3 w-3 inline mr-1" />
              Food will be automatically removed after this time
            </p>
          </div>

          <div className="space-y-2">
            <Label>Pickup Location *</Label>
            <LocationPicker onLocationSelect={handleLocationSelect} />
            {formData.location && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected: {formData.location.address}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white"
            disabled={loading}
          >
            {loading ? 'Sharing...' : 'Share Food'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
