
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MapplsTokenSetupProps {
  onTokenSubmit: (token: string) => void;
}

export const MapplsTokenSetup: React.FC<MapplsTokenSetupProps> = ({ onTokenSubmit }) => {
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onTokenSubmit(token.trim());
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">Setup Mappls Map</h3>
        <p className="text-sm text-gray-600">
          Please enter your Mappls API key to enable the map functionality.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="mappls-token">Mappls API Key</Label>
          <Input
            id="mappls-token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your Mappls API key"
            required
          />
        </div>
        
        <Button type="submit" className="w-full">
          Setup Map
        </Button>
      </form>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>
          Get your API key from{' '}
          <a 
            href="https://about.mappls.com/api/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Mappls Dashboard
          </a>
        </p>
      </div>
    </Card>
  );
};
