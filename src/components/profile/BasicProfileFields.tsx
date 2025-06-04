
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  bio: string;
}

interface BasicProfileFieldsProps {
  profileData: ProfileData;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const BasicProfileFields: React.FC<BasicProfileFieldsProps> = ({
  profileData,
  isEditing,
  onChange
}) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={profileData.name}
            onChange={onChange}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profileData.email}
            onChange={onChange}
            disabled={!isEditing}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          value={profileData.phone}
          onChange={onChange}
          disabled={!isEditing}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={profileData.bio}
          onChange={onChange}
          disabled={!isEditing}
          rows={4}
          placeholder="Tell the community about yourself and your food sharing interests..."
        />
      </div>
    </div>
  );
};

export default BasicProfileFields;
