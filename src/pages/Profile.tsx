
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAutoLocationDetection } from '@/hooks/useAutoLocationDetection';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';

const Profile = () => {
  const { user } = useAuth();
  const { isDetecting } = useAutoLocationDetection();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Demo User',
    email: user?.email || 'demo@swapeat.com',
    bio: 'Passionate about reducing food waste and building community connections. Love sharing fresh produce from my garden!',
    location: 'San Francisco, CA',
    phone: '+1 (555) 123-4567'
  });

  const stats = {
    itemsShared: 47,
    itemsReceived: 23,
    rating: 4.9,
    joinDate: 'March 2024'
  };

  const recentActivity = [
    { id: 1, type: 'shared' as const, item: 'Fresh Tomatoes', date: '2 hours ago', image: 'https://images.unsplash.com/photo-1546470427-e75e37c79c2b?w=100&h=100&fit=crop' },
    { id: 2, type: 'received' as const, item: 'Homemade Bread', date: '1 day ago', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop' },
    { id: 3, type: 'shared' as const, item: 'Apple Pie', date: '3 days ago', image: 'https://images.unsplash.com/photo-1535920527002-b35e96722da9?w=100&h=100&fit=crop' }
  ];

  const handleSave = () => {
    setIsEditing(false);
    console.log('Profile updated:', profileData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Show location detection status */}
          {isDetecting && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-300 text-sm">
                🌍 Detecting your location to enhance your experience...
              </p>
            </div>
          )}

          {/* Profile Header */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg mb-8">
            <div className="p-8">
              <ProfileHeader 
                user={user} 
                profileData={profileData}
                stats={stats}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                handleSave={handleSave}
              />
            </div>
          </Card>

          {/* Tabs */}
          <ProfileTabs 
            recentActivity={recentActivity}
            profileData={profileData}
            isEditing={isEditing}
            setProfileData={setProfileData}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
