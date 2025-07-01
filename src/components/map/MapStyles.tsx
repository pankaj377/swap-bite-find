
import React from 'react';

export const MapStyles: React.FC = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        /* Ensure map container has proper positioning context */
        .leaflet-container {
          position: relative !important;
          z-index: 1 !important;
        }
        
        /* Fix popup positioning within map boundaries */
        .leaflet-popup-pane {
          z-index: 700 !important;
        }
        
        .leaflet-popup {
          position: absolute !important;
          z-index: 1000 !important;
        }
        
        .mobile-optimized-popup {
          position: absolute !important;
          z-index: 1000 !important;
        }
        
        .mobile-optimized-popup .leaflet-popup-content {
          margin: 16px !important;
          line-height: 1.5 !important;
          font-size: 14px !important;
          max-width: 280px !important;
          overflow: hidden !important;
        }
        
        .mobile-optimized-popup .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25) !important;
          background: white !important;
          position: relative !important;
          overflow: hidden !important;
        }
        
        .mobile-optimized-popup .leaflet-popup-tip {
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
          z-index: 999 !important;
        }
        
        /* Ensure popups don't overflow map boundaries */
        .leaflet-popup-content-wrapper {
          max-width: calc(100vw - 40px) !important;
          max-height: calc(100vh - 100px) !important;
          overflow-y: auto !important;
        }
        
        .food-marker {
          cursor: pointer !important;
          -webkit-tap-highlight-color: transparent !important;
          transition: transform 0.2s ease !important;
          z-index: 600 !important;
          position: relative !important;
        }
        
        .food-marker:hover,
        .food-marker:active {
          transform: scale(1.1) !important;
          z-index: 601 !important;
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
        
        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .mobile-optimized-popup {
            max-width: calc(100vw - 20px) !important;
          }
          
          .mobile-optimized-popup .leaflet-popup-content {
            max-width: calc(100vw - 52px) !important;
            margin: 12px !important;
          }
          
          .directions-button {
            font-size: 16px !important;
            padding: 14px !important;
          }
          
          /* Adjust popup positioning for mobile */
          .leaflet-popup {
            transform: translateX(-50%) !important;
          }
        }
        
        /* Touch device optimizations */
        @media (pointer: coarse) {
          .leaflet-popup-close-button {
            width: 30px !important;
            height: 30px !important;
            font-size: 20px !important;
            line-height: 30px !important;
            right: 5px !important;
            top: 5px !important;
          }
          
          /* Ensure popups are properly contained */
          .leaflet-popup {
            max-width: 90vw !important;
          }
        }
        
        /* Fix for popup positioning issues */
        .leaflet-popup-tip-container {
          z-index: 998 !important;
        }
        
        /* Prevent popup from going outside map bounds */
        .leaflet-map-pane {
          position: relative !important;
          overflow: hidden !important;
        }
      `
    }} />
  );
};
