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
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
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
import ShieldIcon from '@mui/icons-material/Shield';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Fix default Leaflet icon paths
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom Leaflet Icons for clean visual distinction
const createCustomIcon = (bgColor, iconText) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        border: 2px solid #ffffff;
      ">
        ${iconText}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const workerIcon = createCustomIcon('#2563eb', '👤');
const shelterIcon = createCustomIcon('#16a34a', '🛡️');
const exitIcon = createCustomIcon('#059669', '🚪');
const medicalIcon = createCustomIcon('#dc2626', '🏥');
const dangerIcon = createCustomIcon('#ea580c', '⚠️');

// Helper to compute distance in meters between two lat/lon points
const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// Component to handle dynamic map panning and bounds fitting
const MapController = ({ center, bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length === 2) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17, animate: true });
    } else if (center) {
      map.flyTo(center, 16, { animate: true, duration: 1.2 });
    }
  }, [center, bounds, map]);

  return null;
};

export const Map = () => {
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [locationHistory, setLocationHistory] = useState([]);
  const [activeNavDestination, setActiveNavDestination] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);

  // Get live browser location (or smooth fallback simulation if GPS is disabled)
  const { location, error, loading: locationLoading, getCurrentLocation, isSimulated } = useGeolocation(trackingEnabled, 10000);

  // Default coordinate if location is initially loading
  const currentMarker = location ? [location.latitude, location.longitude] : [23.8103, 86.4126];
  const lat = currentMarker[0];
  const lon = currentMarker[1];

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

  // Compute live relative distances & ETAs for nearby Mine Safe Zones
  const safeZonesList = [
    {
      id: 'shelter_a',
      name: 'Refuge Chamber Alpha (Oxygen & First Aid)',
      pos: [lat + 0.0006, lon + 0.0008],
      type: 'shelter',
      icon: shelterIcon,
      capacity: '25 Persons',
      oxygenSupply: '72 Hours',
    },
    {
      id: 'exit_ramp',
      name: 'Main Shaft Evacuation Tunnel Exit A',
      pos: [lat + 0.0014, lon + 0.0012],
      type: 'exit',
      icon: exitIcon,
      capacity: 'Unrestricted',
      oxygenSupply: 'Surface Air',
    },
    {
      id: 'medical_bay',
      name: 'Underground First-Aid Medical Bay 2',
      pos: [lat - 0.0005, lon - 0.0011],
      type: 'medical',
      icon: medicalIcon,
      capacity: '10 Beds',
      oxygenSupply: 'Fully Equipped',
    },
    {
      id: 'shelter_b',
      name: 'Refuge Chamber Bravo (Sector 3)',
      pos: [lat - 0.0011, lon + 0.0007],
      type: 'shelter',
      icon: shelterIcon,
      capacity: '15 Persons',
      oxygenSupply: '48 Hours',
    },
  ];

  // Calculate distance in meters & walking time for each safe zone
  const safeZonesWithDistance = safeZonesList.map((sz) => {
    const distMeters = getDistanceMeters(lat, lon, sz.pos[0], sz.pos[1]);
    const etaMins = Math.max(1, Math.round(distMeters / 75)); // Average walking speed ~75m/min
    return {
      ...sz,
      distMeters,
      distanceText: distMeters > 1000 ? `${(distMeters / 1000).toFixed(1)} km` : `${distMeters}m`,
      etaText: `${etaMins} min${etaMins > 1 ? 's' : ''}`,
    };
  });

  // Sort safe zones to find the ABSOLUTE SAFEST & NEAREST zone automatically!
  const safestZone = safeZonesWithDistance.reduce((min, curr) =>
    curr.distMeters < min.distMeters ? curr : min
  , safeZonesWithDistance[0]);

  // Danger zone for safety alerts
  const restrictedDangerZone = [lat + 0.0018, lon - 0.0015];

  const handleLocateMe = () => {
    getCurrentLocation();
    setMapBounds(null);
  };

  const handleStartNavigation = (destination) => {
    const target = destination || safestZone;
    setActiveNavDestination(target);
    setMapBounds([currentMarker, target.pos]);
  };

  const handleClearNavigation = () => {
    setActiveNavDestination(null);
    setMapBounds(null);
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Header & Quick Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            🗺️ Safe Zone Navigation & Live Location
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Real-time GPS telemetry, nearest safe refuge chambers, and optimal evacuation routes.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={<NavigationIcon />}
          onClick={() => handleStartNavigation(safestZone)}
          sx={{
            borderRadius: 8,
            fontWeight: 800,
            px: 3,
            py: 1.2,
            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)',
            '&:hover': { bgcolor: '#15803d' },
          }}
        >
          🛡️ Navigate to Safest Zone ({safestZone.distanceText})
        </Button>
      </Box>

      {/* Location Telemetry Status Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          bgcolor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          border: '1px solid #1e293b',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: isSimulated ? '#f59e0b' : '#22c55e', animation: 'pulse 1.5s infinite' }} />
            <Typography variant="body2" fontWeight="700">
              {isSimulated ? 'Simulated Mine Location' : 'Live Browser GPS Active'}
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ bgcolor: '#334155', display: { xs: 'none', sm: 'block' } }} />

          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            Latitude: <strong style={{ color: '#fff' }}>{lat.toFixed(5)}</strong> | Longitude: <strong style={{ color: '#fff' }}>{lon.toFixed(5)}</strong>
          </Typography>

          <Divider orientation="vertical" flexItem sx={{ bgcolor: '#334155', display: { xs: 'none', sm: 'block' } }} />

          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            Safest Zone: <strong style={{ color: '#4ade80' }}>{safestZone.name} ({safestZone.distanceText})</strong>
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant={trackingEnabled ? 'contained' : 'outlined'}
            color={trackingEnabled ? 'success' : 'inherit'}
            size="small"
            onClick={() => setTrackingEnabled(!trackingEnabled)}
            startIcon={trackingEnabled ? <GpsFixedIcon /> : <GpsOffIcon />}
            sx={{ borderRadius: 6, fontWeight: 700, textTransform: 'none' }}
          >
            {trackingEnabled ? 'GPS Sync On' : 'Enable Sync'}
          </Button>

          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleLocateMe}
            disabled={locationLoading}
            startIcon={locationLoading ? <CircularProgress size={16} color="inherit" /> : <MyLocationIcon />}
            sx={{ borderRadius: 6, fontWeight: 700, textTransform: 'none' }}
          >
            Recenter Me
          </Button>
        </Stack>
      </Paper>

      {/* Active Navigation Header Card */}
      {activeNavDestination && (
        <Alert
          severity="success"
          icon={<ShieldIcon fontSize="large" />}
          action={
            <Button color="inherit" size="small" onClick={handleClearNavigation} sx={{ fontWeight: 800 }}>
              End Guidance
            </Button>
          }
          sx={{
            mb: 2,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #052e16 0%, #166534 100%)',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(22, 163, 74, 0.3)',
          }}
        >
          <Typography variant="subtitle1" fontWeight="800">
            NAVIGATING TO SAFEST ZONE: {activeNavDestination.name.toUpperCase()}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Evacuation Distance: <strong>{activeNavDestination.distanceText}</strong> | Est. Walking Time: <strong>{activeNavDestination.etaText}</strong> | Capacity: <strong>{activeNavDestination.capacity}</strong>
          </Typography>
        </Alert>
      )}

      {/* Nearby Safe Zones Selection Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {safeZonesWithDistance.map((sz) => {
          const isSelected = activeNavDestination?.id === sz.id;
          const isSafest = sz.id === safestZone.id;

          return (
            <Grid item xs={12} sm={6} md={3} key={sz.id}>
              <Card
                onClick={() => handleStartNavigation(sz)}
                sx={{
                  borderRadius: 3,
                  cursor: 'pointer',
                  bgcolor: isSelected ? '#166534' : isSafest ? '#0f172a' : '#ffffff',
                  color: isSelected || isSafest ? '#ffffff' : '#0f172a',
                  border: isSafest ? '2px solid #22c55e' : '1px solid #e2e8f0',
                  boxShadow: isSelected ? '0 6px 20px rgba(22, 163, 74, 0.35)' : '0 2px 8px rgba(0,0,0,0.05)',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isSafest && (
                  <Chip
                    label="NEAREST SAFEST ZONE"
                    color="success"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      height: 20,
                    }}
                  />
                )}

                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: isSelected || isSafest ? '#86efac' : '#64748b', fontWeight: 800, display: 'block', mb: 0.5 }}>
                    {sz.type === 'shelter' ? 'REFUGE CHAMBER' : sz.type === 'exit' ? 'MAIN EXIT RAMP' : 'MEDICAL BAY'}
                  </Typography>

                  <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, pr: isSafest ? 8 : 0 }}>
                    {sz.name}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={`${sz.distanceText} (${sz.etaText})`}
                      size="small"
                      color={isSafest ? 'success' : 'primary'}
                      sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                    />
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {sz.oxygenSupply}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Interactive Mine Map Container */}
      <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <Box sx={{ height: { xs: 450, md: 560 }, width: '100%', position: 'relative' }}>
          <MapContainer center={currentMarker} zoom={16} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Dynamic Recenter / Bounds Controller */}
            <MapController center={currentMarker} bounds={mapBounds} />

            {/* Location History Trail */}
            {locationHistory.length > 1 && (
              <Polyline positions={locationHistory} color="#3b82f6" weight={3} opacity={0.6} />
            )}

            {/* Active Evacuation Path Line */}
            {activeNavDestination && (
              <Polyline
                positions={[currentMarker, activeNavDestination.pos]}
                color="#16a34a"
                weight={6}
                dashArray="12, 12"
              />
            )}

            {/* Worker Current Position Marker & GPS Radius */}
            <Circle center={currentMarker} radius={35} pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.2 }} />
            <Marker position={currentMarker} icon={workerIcon}>
              <Popup>
                <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                  📍 Your Current Mine Position
                </Typography>
                <Typography variant="caption" display="block">
                  GPS: {lat.toFixed(5)}, {lon.toFixed(5)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Status: Safely Connected
                </Typography>
              </Popup>
            </Marker>

            {/* Safe Zone Markers */}
            {safeZonesWithDistance.map((sz) => (
              <Marker key={sz.id} position={sz.pos} icon={sz.icon}>
                <Popup>
                  <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                    🛡️ {sz.name}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Distance: <strong>{sz.distanceText}</strong> | Walk Time: <strong>{sz.etaText}</strong>
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                    Capacity: {sz.capacity} | Oxygen: {sz.oxygenSupply}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => handleStartNavigation(sz)}
                    sx={{ fontSize: '0.72rem', fontWeight: 800 }}
                  >
                    Navigate Here Now
                  </Button>
                </Popup>
              </Marker>
            ))}

            {/* Restricted Hazard Zone */}
            <Circle center={restrictedDangerZone} radius={110} pathOptions={{ color: '#dc2626', fillColor: '#ef4444', fillOpacity: 0.3 }} />
            <Marker position={restrictedDangerZone} icon={dangerIcon}>
              <Popup>
                <Typography variant="subtitle2" fontWeight="bold" color="error.main">
                  ⚠️ Restricted Danger Sector
                </Typography>
                <Typography variant="caption" display="block">High risk area: Gas & Seismicity</Typography>
              </Popup>
            </Marker>
          </MapContainer>
        </Box>
      </Card>
    </Box>
  );
};

export default Map;
