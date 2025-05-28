
import React from 'react';
import { Card } from '@/components/ui/card';

interface MapTokenSetupProps {
  onTokenSubmit: (token: string) => void;
}

export const MapTokenSetup: React.FC<MapTokenSetupProps> = ({ onTokenSubmit }) => {
  // Leaflet doesn't require API tokens, so we can automatically proceed
  React.useEffect(() => {
    onTokenSubmit('leaflet-no-token-required');
  }, [onTokenSubmit]);

  return (
    <Card className="p-6 text-center">
      <p className="text-gray-600">Loading map...</p>
    </Card>
  );
};
