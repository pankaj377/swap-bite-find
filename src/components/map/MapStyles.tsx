
import React from 'react';

export const MapStyles: React.FC = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        .mobile-optimized-popup .leaflet-popup-content {
          margin: 16px !important;
          line-height: 1.5 !important;
          font-size: 14px !important;
          max-width: 280px !important;
        }
        
        .mobile-optimized-popup .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25) !important;
          background: white !important;
        }
        
        .mobile-optimized-popup .leaflet-popup-tip {
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        }
        
        .food-marker {
          cursor: pointer !important;
          -webkit-tap-highlight-color: transparent !important;
          transition: transform 0.2s ease !important;
        }
        
        .food-marker:hover,
        .food-marker:active {
          transform: scale(1.1) !important;
        }
        
        .directions-button {
          width: 100% !important;
          padding: 12px !important;
          background-color: #10b981 !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          transition: background-color 0.2s !important;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation !important;
        }
        
        .directions-button:hover,
        .directions-button:active {
          background-color: #059669 !important;
        }
        
        @media (max-width: 768px) {
          .mobile-optimized-popup {
            max-width: 90vw !important;
          }
          
          .mobile-optimized-popup .leaflet-popup-content {
            max-width: calc(90vw - 32px) !important;
            margin: 12px !important;
          }
          
          .directions-button {
            font-size: 16px !important;
            padding: 14px !important;
          }
        }
        
        @media (pointer: coarse) {
          .leaflet-popup-close-button {
            width: 30px !important;
            height: 30px !important;
            font-size: 20px !important;
            line-height: 30px !important;
          }
        }
      `
    }} />
  );
};
