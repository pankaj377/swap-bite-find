import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, Camera } from 'lucide-react';
import { LocationPicker } from '@/components/LocationPicker';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProfileData {
  name: string;
  email: string;
  location: string;
  phone: string;
  bio: string;
}

interface ProfileSettingsProps {
  profileData: ProfileData;
  isEditing: boolean;
  setProfileData: (data: ProfileData) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  profileData,
  isEditing,
  setProfileData
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [locationData, setLocationData] = useState({
    lat: 0,
    lng: 0,
    address: profileData.location
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfileData({ ...profileData, [id]: value });
  };

  const handleLocationChange = (location: { lat: number; lng: number; address: string }) => {
    console.log('Location changed:', location);
    setLocationData(location);
    setProfileData({ ...profileData, location: location.address });
    
    // Save location to database if user is authenticated
    if (user?.id && location.lat && location.lng) {
      saveLocationToDatabase(location);
    }
  };

  const saveLocationToDatabase = async (location: { lat: number; lng: number; address: string }) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          location_lat: location.lat,
          location_lng: location.lng,
          location_address: location.address
        })
        .eq('id', user?.id);

      if (error) {
        console.error('Error saving location:', error);
        toast.error('Failed to save location');
      } else {
        toast.success('Location saved successfully');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Failed to save location');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        toast.error('Please select an image to upload');
        return;
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      if (!user?.id) {
        toast.error('You must be logged in to upload an avatar');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Uploading file:', fileName);

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', data);

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrlData.publicUrl);

      setAvatarUrl(publicUrlData.publicUrl);

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(`Profile update failed: ${updateError.message}`);
      }

      toast.success('Avatar updated successfully!');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Error uploading avatar');
    } finally {
      setUploading(false);
      // Clear the input so the same file can be selected again
      if (event.target) {
        event.target.value = '';
      }
    }
  };
  
  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profile Settings</h3>
        
        {/* Avatar Upload Section */}
        {isEditing && (
          <div className="mb-6">
            <Label>Profile Picture</Label>
            <div className="mt-2 flex items-center space-x-4">
              <div className="relative">
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={uploading}
                  className="flex items-center space-x-2"
                >
                  {uploading ? (
                    <Upload className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <span>{uploading ? 'Uploading...' : 'Change Photo'}</span>
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  Max file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          {/* Enhanced Location Section */}
          <div className="space-y-2">
            <Label>Location</Label>
            {isEditing ? (
              <div className="space-y-4">
                <LocationPicker
                  onLocationChange={handleLocationChange}
                  initialLocation={locationData}
                />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium mb-2">Why we need your location:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Show nearby food items in your area</li>
                    <li>Help other users find food you're sharing</li>
                    <li>Calculate distances for food pickup</li>
                    <li>Improve community connections in your neighborhood</li>
                  </ul>
                </div>
              </div>
            ) : (
              <Input
                value={profileData.location}
                disabled
                placeholder="No location set"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={handleChange}
              disabled={!isEditing}
              rows={4}
              placeholder="Tell the community about yourself and your food sharing interests..."
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileSettings;
