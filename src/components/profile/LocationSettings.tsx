
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LocationPicker } from '@/components/LocationPicker';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LocationSettingsProps {
  profileData: {
    location: string;
  };
  isEditing: boolean;
  locationData: {
    lat: number;
    lng: number;
    address: string;
  };
  onLocationChange: (location: { lat: number; lng: number; address: string }) => void;
  onProfileDataChange: (data: any) => void;
}

const LocationSettings: React.FC<LocationSettingsProps> = ({
  profileData,
  isEditing,
  locationData,
  onLocationChange,
  onProfileDataChange
}) => {
  const { user } = useAuth();

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

  const handleLocationChange = (location: { lat: number; lng: number; address: string }) => {
    console.log('Location changed:', location);
    onLocationChange(location);
    onProfileDataChange({ ...profileData, location: location.address });
    
    // Save location to database if user is authenticated
    if (user?.id && location.lat && location.lng) {
      saveLocationToDatabase(location);
    }
  };

  return (
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
  );
};

export default LocationSettings;
