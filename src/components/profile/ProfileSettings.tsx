
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
    setLocationData(location);
    setProfileData({ ...profileData, location: location.address });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Create storage bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarBucket = buckets?.find(bucket => bucket.name === 'avatars');
      
      if (!avatarBucket) {
        await supabase.storage.createBucket('avatars', {
          public: true,
          allowedMimeTypes: ['image/*']
        });
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(data.publicUrl);

      // Update user profile with new avatar URL
      if (user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: data.publicUrl })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }
      }

      toast.success('Avatar updated successfully!');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
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
                  src={avatarUrl}
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

          {/* Location Section */}
          <div className="space-y-2">
            <Label>Location</Label>
            {isEditing ? (
              <LocationPicker
                onLocationChange={handleLocationChange}
                initialLocation={locationData}
              />
            ) : (
              <Input
                value={profileData.location}
                disabled
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
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileSettings;
