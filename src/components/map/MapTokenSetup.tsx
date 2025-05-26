
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface MapTokenSetupProps {
  onTokenSubmit: (token: string) => void;
}

export const MapTokenSetup: React.FC<MapTokenSetupProps> = ({ onTokenSubmit }) => {
  const handleTokenSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = formData.get('token') as string;
    if (token) {
      onTokenSubmit(token);
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
      <Card className="p-6 max-w-md">
        <div className="text-center mb-4">
          <MapPin className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Map Setup Required
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            To display the interactive map, please enter your Mapbox public token. 
            You can get one at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">mapbox.com</a>
          </p>
        </div>
        <form onSubmit={handleTokenSubmit} className="space-y-3">
          <input
            type="text"
            name="token"
            placeholder="Enter your Mapbox token"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <Button type="submit" className="w-full">
            Initialize Map
          </Button>
        </form>
      </Card>
    </div>
  );
};
