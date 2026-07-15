import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';

const GeolocationContext = createContext(null);

export const GeolocationProvider = ({ children, userRole, isAuthenticated }) => {
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  // Automatically start tracking if the user is authenticated and is a worker
  useEffect(() => {
    if (isAuthenticated && userRole === 'worker') {
      setTrackingEnabled(true);
    } else {
      setTrackingEnabled(false);
    }
  }, [isAuthenticated, userRole]);

  // Update location every 10 seconds (10000ms)
  const geo = useGeolocation(trackingEnabled, 10000);

  return (
    <GeolocationContext.Provider value={{ ...geo, trackingEnabled, setTrackingEnabled }}>
      {children}
    </GeolocationContext.Provider>
  );
};

export const useGeo = () => {
  const context = useContext(GeolocationContext);
  if (!context) {
    throw new Error('useGeo must be used within a GeolocationProvider');
  }
  return context;
};
