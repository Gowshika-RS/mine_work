import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Stack,
  Paper,
  Divider,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from 'axios';
import { useGeolocation } from '../../hooks/useGeolocation';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsOffIcon from '@mui/icons-material/GpsOff';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import NavigationIcon from '@mui/icons-material/Navigation';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ShieldIcon from '@mui/icons-material/Shield';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [12.9716, 77.5946];

export const Map = () => {
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [locationHistory, setLocationHistory] = useState([]);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [activeNavDestination, setActiveNavDestination] = useState(null);
  
  // Auto-refresh every 12 seconds
  const { location, error, loading: locationLoading, getCurrentLocation, isSimulated } = useGeolocation(trackingEnabled, 12000);

  useEffect(() => {
    const fetchLocationHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get('http://localhost:8000/api/locations/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.length > 0) {
          setLocationHistory(
            response.data.map((loc) => [
              parseFloat(loc.latitude),
              parseFloat(loc.longitude),
            ])
          );
        }
      } catch (err) {
        console.error('Failed to fetch location history:', err);
      }
    };

    fetchLocationHistory();
  }, []);

  useEffect(() => {
    if (location) {
      setMapCenter([location.latitude, location.longitude]);
    }
  }, [location]);

  const handleLocateMe = () => {
    getCurrentLocation();
    if (location) {
      setMapCenter([location.latitude, location.longitude]);
    }
  };

  const currentMarker = location ? [location.latitude, location.longitude] : mapCenter;
  const lat = currentMarker[0];
  const lon = currentMarker[1];

  // Mine Safety Landmarks
  const landmarks = {
    nearestExit: { name: "Nearest Tunnel Exit Ramp A", pos: [lat + 0.0012, lon + 0.0015], distance: "120m", eta: "2 mins", type: "exit" },
    emergencyShelter: { name: "Refuge Chamber B (Oxygen/Food)", pos: [lat - 0.0008, lon + 0.0010], distance: "45m", eta: "1 min", type: "shelter" },
    medicalRoom: { name: "Underground First-Aid Bay 2", pos: [lat - 0.0004, lon - 0.0014], distance: "85m", eta: "1.5 mins", type: "medical" },
    assemblyPoint: { name: "Surface Muster Station Alpha", pos: [lat - 0.0015, lon - 0.0012], distance: "210m", eta: "4 mins", type: "assembly" },
    supervisorOffice: { name: "Sector 3 Supervisor Control", pos: [lat + 0.0018, lon - 0.0009], distance: "160m", eta: "3 mins", type: "supervisor" },
  };

  const restrictedZone = [lat + 0.0020, lon - 0.0018];

  const handleTriggerSafeNav = (destKey = "emergencyShelter") => {
    setActiveNavDestination(landmarks[destKey]);
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          🗺️ Safe Zone Navigation & Mine Map
        </Typography>

        <Button
          variant="contained"
          color="error"
          startIcon={<NavigationIcon />}
          onClick={() => handleTriggerSafeNav("emergencyShelter")}
          sx={{ borderRadius: 8, fontWeight: 'bold', animation: 'pulse 2s infinite' }}
        >
          🚨 One-Tap Emergency Evacuation Route
        </Button>
      </Box>

      {/* Control Buttons */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant={trackingEnabled ? 'contained' : 'outlined'}
          color={trackingEnabled ? 'success' : 'primary'}
          onClick={() => setTrackingEnabled(!trackingEnabled)}
          disabled={locationLoading}
          startIcon={trackingEnabled ? <GpsFixedIcon /> : <GpsOffIcon />}
          sx={{ borderRadius: 8, fontWeight: 'bold' }}
        >
          {trackingEnabled ? 'Auto-GPS Active (12s Sync)' : 'Enable GPS'}
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleLocateMe}
          disabled={locationLoading}
          startIcon={locationLoading ? <CircularProgress size={18} color="inherit" /> : <MyLocationIcon />}
          sx={{ borderRadius: 8, fontWeight: 'bold' }}
        >
          Locate Me
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

      {/* Active Navigation Header Card */}
      {activeNavDestination && (
        <Alert
          severity="success"
          icon={<ShieldIcon fontSize="inherit" />}
          action={
            <Button color="inherit" size="small" onClick={() => setActiveNavDestination(null)}>
              Clear Route
            </Button>
          }
          sx={{ mb: 2, borderRadius: 3, background: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)', color: '#fff' }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            NAVIGATING TO: {activeNavDestination.name}
          </Typography>
          <Typography variant="body2">
            Distance: <strong>{activeNavDestination.distance}</strong> | Est. Walking Time: <strong>{activeNavDestination.eta}</strong>
          </Typography>
        </Alert>
      )}

      {/* Geolocation & Landmarks Grid */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {Object.entries(landmarks).map(([key, lm]) => (
          <Grid item xs={6} sm={2.4} key={key}>
            <Card
              onClick={() => handleTriggerSafeNav(key)}
              sx={{
                borderRadius: 3,
                cursor: 'pointer',
                bgcolor: activeNavDestination?.name === lm.name ? '#0284c7' : '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
                '&:hover': { bgcolor: '#0369a1', transform: 'translateY(-2px)' },
                transition: 'all 0.2s ease',
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, textAlign: 'center' }}>
                <Typography variant="caption" display="block" sx={{ color: '#94a3b8', fontWeight: 'bold' }}>
                  {lm.type.toUpperCase()}
                </Typography>
                <Typography variant="body2" fontWeight="bold" noWrap sx={{ my: 0.5 }}>
                  {lm.name}
                </Typography>
                <Chip label={`${lm.distance} (${lm.eta})`} size="small" color="success" sx={{ fontSize: '0.7rem' }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Interactive Map Container */}
      <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
        <Box sx={{ height: { xs: 420, md: 540 }, width: '100%' }}>
          <MapContainer center={currentMarker} zoom={16} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Location History Polyline */}
            {locationHistory.length > 1 && (
              <Polyline positions={locationHistory} color="#2563EB" weight={3} opacity={0.6} />
            )}

            {/* Active Navigation Route Line */}
            {activeNavDestination && (
              <Polyline
                positions={[currentMarker, activeNavDestination.pos]}
                color="#22c55e"
                weight={6}
                dashArray="10, 10"
              />
            )}

            {/* Worker Location Marker */}
            <Marker position={currentMarker}>
              <Popup>
                <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                  📍 Current Worker Position
                </Typography>
                <Typography variant="caption" display="block">
                  GPS: {currentMarker[0].toFixed(5)}, {currentMarker[1].toFixed(5)}
                </Typography>
              </Popup>
            </Marker>

            {/* Landmark Markers */}
            {Object.entries(landmarks).map(([key, lm]) => (
              <Marker key={key} position={lm.pos}>
                <Popup>
                  <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                    🛡️ {lm.name}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Distance: {lm.distance} | Walk ETA: {lm.eta}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => handleTriggerSafeNav(key)}
                    sx={{ mt: 1, fontSize: '0.7rem' }}
                  >
                    Navigate Here
                  </Button>
                </Popup>
              </Marker>
            ))}

            {/* Restricted Danger Zone */}
            <Circle center={restrictedZone} radius={120} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.25 }} />
            <Marker position={restrictedZone}>
              <Popup>
                <Typography variant="subtitle2" fontWeight="bold" color="error.main">
                  ⚠️ Restricted Blasting Zone 3
                </Typography>
                <Typography variant="caption" display="block">DANGER: High risk area</Typography>
              </Popup>
            </Marker>
          </MapContainer>
        </Box>
      </Card>
    </Box>
  );
};

export default Map;
