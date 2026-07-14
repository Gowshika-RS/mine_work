
import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, CircularProgress, Alert, Chip } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from 'axios';
import { useGeolocation } from '../../hooks/useGeolocation';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsOffIcon from '@mui/icons-material/GpsOff';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [23.8103, 86.4126]; // Dhanbad Mine area

export const Map = () => {
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [locationHistory, setLocationHistory] = useState([]);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  
  const { location, error, loading: locationLoading, getCurrentLocation, isSimulated } = useGeolocation(trackingEnabled, 10000);

  // Fetch location history on component mount
  useEffect(() => {
    const fetchLocationHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get('http://localhost:8000/api/locations/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data) {
          setLocationHistory(
            response.data.map((loc) => [
              parseFloat(loc.latitude),
              parseFloat(loc.longitude),
            ])
          );
          if (response.data.length > 0) {
            const latest = response.data[0];
            setMapCenter([parseFloat(latest.latitude), parseFloat(latest.longitude)]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch location history:', err);
      }
    };

    fetchLocationHistory();
  }, []);

  // Update map center when current location changes
  useEffect(() => {
    if (location) {
      setMapCenter([location.latitude, location.longitude]);
    }
  }, [location]);

  const handleGetCurrentLocation = () => {
    getCurrentLocation();
  };

  const toggleTracking = () => {
    setTrackingEnabled(!trackingEnabled);
  };

  const currentMarker = location
    ? [location.latitude, location.longitude]
    : null;

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        Interactive Mine Map
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant={trackingEnabled ? 'contained' : 'outlined'}
          color={trackingEnabled ? 'success' : 'primary'}
          onClick={toggleTracking}
          disabled={locationLoading}
          startIcon={trackingEnabled ? <GpsFixedIcon /> : <GpsOffIcon />}
          sx={{ borderRadius: 8 }}
        >
          {trackingEnabled ? 'GPS Tracking Active' : 'Enable Tracking'}
        </Button>
        <Button
          variant="outlined"
          onClick={handleGetCurrentLocation}
          disabled={locationLoading}
          sx={{ borderRadius: 8 }}
        >
          {locationLoading ? <CircularProgress size={20} /> : 'Scan Current Location'}
        </Button>

        {isSimulated && (
          <Chip 
            label="Simulated GPS Active" 
            color="warning" 
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
        )}
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {location && (
          <Grid item xs={12} sm={6}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Latitude / Longitude
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="textSecondary" display="block">
                Map Status
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {isSimulated ? 'Simulating Dhanbad Mine Route' : 'Using device GPS sensor'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
        <Box sx={{ height: { xs: 400, md: 550 }, width: '100%' }}>
          <MapContainer center={mapCenter} zoom={16} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Location History Path */}
            {locationHistory.length > 1 && (
              <Polyline positions={locationHistory} color="#2563EB" weight={3} opacity={0.6} />
            )}

            {/* Current Location Marker */}
            {currentMarker && (
              <Marker
                position={currentMarker}
                icon={
                  new L.Icon({
                    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjMjU2M0VCIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                  })
                }
              >
                <Popup>
                  <Typography variant="subtitle2" fontWeight="bold">Your Position</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {isSimulated ? 'Simulated coordinates' : 'Active GPS track'}
                  </Typography>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </Box>
      </Card>
    </Box>
  );
};
