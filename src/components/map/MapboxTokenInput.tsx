import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface MapboxTokenInputProps {
  onTokenSubmit: (token: string) => void;
}

export const MapboxTokenInput: React.FC<MapboxTokenInputProps> = ({ onTokenSubmit }) => {
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error('Please enter a valid Mapbox token');
      return;
    }
    if (!token.startsWith('pk.')) {
      toast.error('Mapbox public tokens should start with "pk."');
      return;
    }
    onTokenSubmit(token.trim());
    toast.success('Mapbox token applied successfully!');
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Mapbox Configuration Required
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            To display the map, please enter your Mapbox public access token.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="mapbox-token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mapbox Public Token
            </label>
            <Input
              id="mapbox-token"
              type="text"
              placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsZ..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          
          <Button type="submit" className="w-full">
            Apply Token & Load Map
          </Button>
        </form>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            💡 Get your free Mapbox token at{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              mapbox.com
            </a>
            {' '}→ Account → Access tokens
          </p>
        </div>
      </div>
    </Card>
  );
};