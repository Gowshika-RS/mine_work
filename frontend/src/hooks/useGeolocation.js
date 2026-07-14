import { useState, useEffect } from 'react';
import axios from 'axios';

// Dhanbad Mine coordinates as realistic mining center
const MINE_LAT = 23.8103;
const MINE_LON = 86.4126;

export const useGeolocation = (trackingEnabled = false, updateInterval = 10000) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);

  // Helper to generate simulated coordinate near Dhanbad mine
  const getSimulatedLocation = (prevLoc) => {
    const baseLat = prevLoc ? prevLoc.latitude : MINE_LAT;
    const baseLon = prevLoc ? prevLoc.longitude : MINE_LON;
    // Walk randomly: very small step sizes
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
      setError('Geolocation not supported. Starting simulation...');
      setLocation(getSimulatedLocation(null));
      setIsSimulated(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude, timestamp: new Date(), isSimulated: false });
        setError(null);
        setIsSimulated(false);
        setLoading(false);
      },
      (err) => {
        console.warn('GPS failed, starting simulation: ', err.message);
        setError(`GPS Unavailable (${err.message}). Simulating movement near Mine Site.`);
        setLocation(getSimulatedLocation(null));
        setIsSimulated(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Watch position continuously or simulate if active
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
          console.warn('Watch Position failed, switching to Simulation:', err.message);
          setIsSimulated(true);
          setError(`Simulation mode active: GPS permission denied or unavailable.`);
          if (!location) {
            setLocation(getSimulatedLocation(null));
          }
          intervalId = setInterval(() => {
            setLocation(prev => getSimulatedLocation(prev));
          }, updateInterval);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
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

    const sendLocation = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        await axios.post(
          'http://localhost:8000/api/locations/',
          {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('Failed to send location:', err);
      }
    };

    // Send immediately
    sendLocation();

    // Then send periodically
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
