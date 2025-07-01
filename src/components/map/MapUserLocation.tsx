
import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapUserLocationProps {
  map: L.Map | null;
  userLocation: {lat: number; lng: number} | null;
}

export const MapUserLocation: React.FC<MapUserLocationProps> = ({
  map,
  userLocation
}) => {
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!map || !userLocation) return;

    try {
      // Remove existing user marker
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
      }

      // Create custom user location icon
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 4px solid #3b82f6;
            background-color: white;
            position: relative;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          ">
            <div style="
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background-color: #3b82f6;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            "></div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { 
        icon: userIcon 
      }).addTo(map);

      userMarkerRef.current.bindPopup('Your Location');
      console.log('User marker added successfully');
    } catch (error) {
      console.error('Error adding user marker:', error);
    }

    return () => {
      if (userMarkerRef.current && map) {
        map.removeLayer(userMarkerRef.current);
      }
    };
  }, [map, userLocation]);

  return null;
};
