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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Upload, X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [expiryTime, setExpiryTime] = useState<string>('12:00');
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removePhoto = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    // Reset to default image
    setFoodData(prev => ({ 
      ...prev, 
      image_url: 'https://images.unsplash.com/photo-1546470427-e75e37c79c2b?w=400&h=300&fit=crop' 
    }));
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!selectedFile || !user) return null;

    setUploadingPhoto(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('food-photos')
        .upload(fileName, selectedFile);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('food-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
      return null;
    } finally {
      setUploadingPhoto(false);
    }
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

    if (!expiryDate) {
      toast.error("Please select an expiry date");
      return;
    }
    
    setLoading(true);

    try {
      let imageUrl = foodData.image_url;

      // Upload photo if user selected one
      if (selectedFile) {
        const uploadedUrl = await uploadPhoto();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      // Combine expiry date and time
      const [hours, minutes] = expiryTime.split(':');
      const expiryDateTime = new Date(expiryDate);
      expiryDateTime.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase.from('food_items').insert({
        user_id: user.id,
        title: foodData.title,
        description: foodData.description,
        category: foodData.category,
        image_url: imageUrl,
        location_lat: foodData.location_lat,
        location_lng: foodData.location_lng,
        location_address: foodData.location_address,
        expire_date: expiryDateTime.toISOString(),
      });

      if (error) {
        throw error;
      }

      toast.success("Food item shared successfully!");
      onFoodAdded();
      onOpenChange(false);
      
      // Reset form
      setFoodData({
        title: '',
        description: '',
        category: 'vegetables',
        image_url: 'https://images.unsplash.com/photo-1546470427-e75e37c79c2b?w=400&h=300&fit=crop',
        location_lat: 40.7128,
        location_lng: -74.0060,
        location_address: 'Near your location',
      });
      setExpiryDate(undefined);
      setExpiryTime('12:00');
      removePhoto();
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Food Item</DialogTitle>
          <DialogDescription>
            Share excess food with your neighbors and reduce waste
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Photo Upload Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Food Photo</label>
            
            {previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Food preview" 
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={removePhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Add a photo of your food</p>
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Photo
                      </span>
                    </Button>
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max 5MB • JPG, PNG, or WebP
                  </p>
                </div>
              </div>
            )}
          </div>

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

          {/* Expiry Date and Time Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Expiry Date *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Expiry Time *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="time"
                  value={expiryTime}
                  onChange={(e) => setExpiryTime(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Food items will be automatically removed after the expiry date and time
          </p>

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
              disabled={loading || uploadingPhoto}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploadingPhoto}>
              {loading ? 'Sharing...' : uploadingPhoto ? 'Uploading...' : 'Share Food'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
