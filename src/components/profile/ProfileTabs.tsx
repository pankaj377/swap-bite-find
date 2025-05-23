
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ActivityList from './ActivityList';
import ProfileSettings from './ProfileSettings';
import ReviewsList from './ReviewsList';

interface ProfileTabsProps {
  recentActivity: {
    id: number;
    type: 'shared' | 'received';
    item: string;
    date: string;
    image: string;
  }[];
  profileData: {
    name: string;
    email: string;
    location: string;
    phone: string;
    bio: string;
  };
  isEditing: boolean;
  setProfileData: (data: any) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ 
  recentActivity, 
  profileData, 
  isEditing, 
  setProfileData 
}) => {
  return (
    <Tabs defaultValue="activity" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>

      <TabsContent value="activity">
        <ActivityList activities={recentActivity} />
      </TabsContent>

      <TabsContent value="settings">
        <ProfileSettings 
          profileData={profileData} 
          isEditing={isEditing} 
          setProfileData={setProfileData} 
        />
      </TabsContent>

      <TabsContent value="reviews">
        <ReviewsList />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
