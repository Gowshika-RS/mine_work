import { useState, useEffect } from 'react';
import apiClient from '../api/client';

// Default mine center (used ONLY if user denies browser location permission)
const MINE_LAT = 23.8103;
const MINE_LON = 86.4126;

export const useGeolocation = (trackingEnabled = false, updateInterval = 10000) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);

  // Helper to generate simulated coordinate if GPS permission is denied
  const getSimulatedLocation = (prevLoc) => {
    const baseLat = prevLoc ? prevLoc.latitude : MINE_LAT;
    const baseLon = prevLoc ? prevLoc.longitude : MINE_LON;
    const offsetLat = (Math.random() - 0.5) * 0.0005;
    const offsetLon = (Math.random() - 0.5) * 0.0005;
    return {
      latitude: baseLat + offsetLat,
      longitude: baseLon + offsetLon,
      timestamp: new Date(),
      isSimulated: true
    };
  };

  const getCurrentLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser.');
      setLocation(getSimulatedLocation(null));
      setIsSimulated(true);
      setLoading(false);
      return;
    }

    // Try standard accuracy first (fast & reliable on Windows/Mac desktops via IP/Wi-Fi)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude, timestamp: new Date(), isSimulated: false });
        setError(null);
        setIsSimulated(false);
        setLoading(false);
      },
      (err) => {
        console.warn('First GPS attempt failed, retrying fallback:', err.message);
        // Fallback attempt with relaxed constraints
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setLocation({ latitude, longitude, timestamp: new Date(), isSimulated: false });
            setError(null);
            setIsSimulated(false);
            setLoading(false);
          },
          (err2) => {
            console.warn('GPS unavailable or permission denied:', err2.message);
            setError('Browser location access blocked or unavailable. Click "Allow" in browser location bar.');
            setLocation(getSimulatedLocation(null));
            setIsSimulated(true);
            setLoading(false);
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  // Request real location immediately on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Watch position continuously
  useEffect(() => {
    if (!trackingEnabled) return;

    let intervalId = null;
    let watchId = null;

    if (!navigator.geolocation) {
      setIsSimulated(true);
      intervalId = setInterval(() => {
        setLocation(prev => getSimulatedLocation(prev));
      }, updateInterval);
    } else {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude, timestamp: new Date(), isSimulated: false });
          setError(null);
          setIsSimulated(false);
        },
        (err) => {
          console.warn('Watch Position failed:', err.message);
          setIsSimulated(true);
          setError('Browser location access blocked or unavailable.');
          if (!location) {
            setLocation(getSimulatedLocation(null));
          }
          intervalId = setInterval(() => {
            setLocation(prev => getSimulatedLocation(prev));
          }, updateInterval);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [trackingEnabled, updateInterval]);

  // Send location to backend periodically
  useEffect(() => {
    if (!trackingEnabled || !location) return;

    let authFailed = false;

    const sendLocation = async () => {
      if (authFailed) return;
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        await apiClient.post('/locations/', {
          latitude: location.latitude,
          longitude: location.longitude,
        });
      } catch (err) {
        if (err.response && err.response.status === 401) {
          authFailed = true;
        }
      }
    };

    sendLocation();
    const interval = setInterval(sendLocation, updateInterval);
    return () => clearInterval(interval);
  }, [trackingEnabled, location, updateInterval]);

  return {
    location,
    error,
    loading,
    getCurrentLocation,
    isSimulated
  };
};

export default useGeolocation;
