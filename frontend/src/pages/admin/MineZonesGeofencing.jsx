import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  GpsFixed as ZoneIcon,
  Shield as SafeIcon,
  Warning as DangerIcon,
  PersonPin as WorkerPinIcon,
  MyLocation as LocateIcon,
  Refresh as RefreshIcon,
  WarningAmber as SosIcon,
  LocalHospital as MedicalIcon,
  ExitToApp as ExitIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import apiClient from '../../api/client';

// Fix Leaflet icons
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom map markers generator
const createMapIcon = (bgColor, labelIcon, isEmergency = false) => {
  return L.divIcon({
    className: 'admin-map-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        width: ${isEmergency ? '42px' : '36px'};
        height: ${isEmergency ? '42px' : '36px'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.4);
        border: 2px solid #ffffff;
        ${isEmergency ? 'animation: pulse 1.2s infinite;' : ''}
      ">
        ${labelIcon}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const workerNormalIcon = createMapIcon('#2563eb', '👷');
const workerSosIcon = createMapIcon('#dc2626', '🚨', true);
const shelterIcon = createMapIcon('#16a34a', '🛡️');
const exitIcon = createMapIcon('#059669', '🚪');
const medicalIcon = createMapIcon('#d97706', '🏥');
const dangerIcon = createMapIcon('#b91c1c', '⚠️');

// Helper to fit bounds / pan map dynamically
const MapController = ({ center, selectedWorker }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedWorker) {
      map.flyTo([selectedWorker.latitude, selectedWorker.longitude], 17, { animate: true, duration: 1.2 });
    } else if (center) {
      map.flyTo(center, 15, { animate: true });
    }
  }, [center, selectedWorker, map]);

  return null;
};

export default function MineZonesGeofencing() {
  const [data, setData] = useState(null);
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s live sync
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setError('');
    try {
      const [zonesRes, workersRes] = await Promise.all([
        apiClient.get('/admin/zones'),
        apiClient.get('/admin/live-worker-locations'),
      ]);
      setData(zonesRes.data);
      setWorkerData(workersRes.data);
    } catch (err) {
      console.error('Failed to load geofence or worker locations:', err);
      setError('Could not sync live worker positions or geofence data.');
    } finally {
      setLoading(false);
    }
  };

  const { zones = [] } = data || {};
  const { workers = [], total_workers = 0, workers_in_safe_zones = 0, workers_in_risk_zones = 0, sos_active_count = 0 } = workerData || {};

  // Filter workers based on selection
  const filteredWorkers = workers.filter((w) => {
    if (filterType === 'SAFE') return w.zone_risk === 'Safe';
    if (filterType === 'RISK') return w.zone_risk !== 'Safe';
    if (filterType === 'SOS') return w.has_sos;
    return true;
  });

  const defaultCenter = workers.length > 0
    ? [workers[0].latitude, workers[0].longitude]
    : [23.8103, 86.4126];

  return (
    <Box sx={{ py: 2, maxWidth: 1250, mx: 'auto' }}>
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          border: '1px solid #334155'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <ZoneIcon sx={{ fontSize: 36, color: '#38bdf8' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Admin Safe Zone Navigation & Live Worker Location Map
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Real-time tracking for all active mine workers, refuge chamber geofences, and restricted danger sectors.
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={fetchData}
              startIcon={<RefreshIcon />}
              sx={{ borderRadius: 6, textTransform: 'none', fontWeight: 'bold' }}
            >
              Refresh Telemetry
            </Button>
          </Stack>
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}

        {/* Live Status Cards */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6} sm={3}>
            <Card
              onClick={() => setFilterType('ALL')}
              sx={{
                bgcolor: filterType === 'ALL' ? '#1e293b' : '#090d16',
                color: '#fff',
                border: filterType === 'ALL' ? '2px solid #38bdf8' : '1px solid #334155',
                cursor: 'pointer',
                borderRadius: 2.5
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="#94a3b8" fontWeight="bold">TOTAL WORKERS MAPPED</Typography>
                <Typography variant="h4" fontWeight="800" sx={{ color: '#38bdf8', my: 0.5 }}>
                  {total_workers}
                </Typography>
                <Typography variant="caption" color="#64748b">Active GPS Telemetry</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card
              onClick={() => setFilterType('SAFE')}
              sx={{
                bgcolor: filterType === 'SAFE' ? '#14532d' : '#090d16',
                color: '#fff',
                border: filterType === 'SAFE' ? '2px solid #22c55e' : '1px solid #334155',
                cursor: 'pointer',
                borderRadius: 2.5
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="#86efac" fontWeight="bold">IN SAFE REFUGE ZONES</Typography>
                <Typography variant="h4" fontWeight="800" sx={{ color: '#22c55e', my: 0.5 }}>
                  {workers_in_safe_zones}
                </Typography>
                <Typography variant="caption" color="#86efac">Normal Operations</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card
              onClick={() => setFilterType('RISK')}
              sx={{
                bgcolor: filterType === 'RISK' ? '#7c2d12' : '#090d16',
                color: '#fff',
                border: filterType === 'RISK' ? '2px solid #f97316' : '1px solid #334155',
                cursor: 'pointer',
                borderRadius: 2.5
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="#fdba74" fontWeight="bold">HIGH RISK / DANGER ZONE</Typography>
                <Typography variant="h4" fontWeight="800" sx={{ color: '#f97316', my: 0.5 }}>
                  {workers_in_risk_zones}
                </Typography>
                <Typography variant="caption" color="#fdba74">Geofence Proximity Warning</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card
              onClick={() => setFilterType('SOS')}
              sx={{
                bgcolor: filterType === 'SOS' ? '#7f1d1d' : '#090d16',
                color: '#fff',
                border: filterType === 'SOS' ? '2px solid #ef4444' : '1px solid #334155',
                cursor: 'pointer',
                borderRadius: 2.5
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="#fca5a5" fontWeight="bold">EMERGENCY SOS ALERTS</Typography>
                <Typography variant="h4" fontWeight="800" sx={{ color: '#ef4444', my: 0.5 }}>
                  {sos_active_count}
                </Typography>
                <Typography variant="caption" color="#fca5a5">Immediate Response Needed</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Interactive Map & Worker Roster Split view */}
      <Grid container spacing={2.5}>
        {/* Left Interactive Leaflet Map */}
        <Grid item xs={12} md={8.5}>
          <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }}>
            <Box sx={{ height: 600, width: '100%', position: 'relative' }}>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress />
                </Box>
              ) : (
                <MapContainer center={defaultCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Controller */}
                  <MapController center={defaultCenter} selectedWorker={selectedWorker} />

                  {/* Render Geofence Zones */}
                  {zones.map((z) => {
                    const coords = z.coordinates || {};
                    const zLat = coords.latitude ? parseFloat(coords.latitude) : defaultCenter[0];
                    const zLng = coords.longitude ? parseFloat(coords.longitude) : defaultCenter[1];
                    const radius = coords.radius ? parseFloat(coords.radius) : 100;
                    const isRestricted = z.zone_type === 'restricted';

                    return (
                      <React.Fragment key={z.id}>
                        <Circle
                          center={[zLat, zLng]}
                          radius={radius}
                          pathOptions={{
                            color: isRestricted ? '#dc2626' : (z.zone_type === 'high_risk' ? '#f97316' : '#16a34a'),
                            fillColor: isRestricted ? '#ef4444' : (z.zone_type === 'high_risk' ? '#fb923c' : '#4ade80'),
                            fillOpacity: isRestricted ? 0.25 : 0.15,
                          }}
                        />
                        <Marker position={[zLat, zLng]} icon={isRestricted ? dangerIcon : shelterIcon}>
                          <Popup>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {z.name} ({z.zone_type.toUpperCase()})
                            </Typography>
                            <Typography variant="caption" display="block">
                              Risk Level: <strong>{z.risk_level}</strong>
                            </Typography>
                          </Popup>
                        </Marker>
                      </React.Fragment>
                    );
                  })}

                  {/* Render ALL Live Worker Markers */}
                  {filteredWorkers.map((w) => (
                    <Marker
                      key={w.id}
                      position={[w.latitude, w.longitude]}
                      icon={w.has_sos ? workerSosIcon : workerNormalIcon}
                    >
                      <Popup>
                        <Box sx={{ minWidth: 180 }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                            👷 {w.full_name} ({w.employee_id})
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                            Role: {w.job_title} ({w.department})
                          </Typography>
                          <Typography variant="caption" display="block">
                            Zone: <strong style={{ color: w.zone_risk === 'Safe' ? '#16a34a' : '#dc2626' }}>{w.current_zone}</strong>
                          </Typography>
                          <Typography variant="caption" display="block">
                            Phone: {w.phone_number}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            GPS Sync: {w.timestamp}
                          </Typography>

                          {w.has_sos && (
                            <Alert severity="error" sx={{ mt: 1, p: 0.5, fontSize: '0.72rem' }}>
                              🚨 SOS ACTIVE: {w.sos_message || 'Emergency button pressed!'}
                            </Alert>
                          )}
                        </Box>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Right Live Worker Telemetry List */}
        <Grid item xs={12} md={3.5}>
          <Card sx={{ borderRadius: 4, height: 600, display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0' }}>
            <Box sx={{ p: 2, bgcolor: '#0f172a', color: '#fff' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                👷 Active Workers ({filteredWorkers.length})
              </Typography>
              <Typography variant="caption" color="#94a3b8">
                Click a worker card to fly camera to position
              </Typography>
            </Box>

            <Box sx={{ p: 1.5, overflowY: 'auto', flexGrow: 1, bgcolor: '#f8fafc' }}>
              {filteredWorkers.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No workers match current filter criteria.
                </Typography>
              ) : (
                filteredWorkers.map((w) => {
                  const isSelected = selectedWorker?.id === w.id;
                  return (
                    <Card
                      key={w.id}
                      onClick={() => setSelectedWorker(w)}
                      sx={{
                        mb: 1.2,
                        p: 1.5,
                        borderRadius: 2.5,
                        cursor: 'pointer',
                        bgcolor: isSelected ? '#eff6ff' : '#ffffff',
                        border: w.has_sos ? '2px solid #ef4444' : isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
                        '&:hover': { bgcolor: '#f1f5f9', transform: 'translateY(-1px)' },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="body2" fontWeight="800" sx={{ color: '#0f172a' }}>
                            {w.full_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                            {w.employee_id} • {w.job_title}
                          </Typography>
                        </Box>

                        <Chip
                          label={w.has_sos ? 'SOS 🚨' : w.current_zone}
                          color={w.has_sos ? 'error' : (w.zone_risk === 'Safe' ? 'success' : 'warning')}
                          size="small"
                          sx={{ fontSize: '0.68rem', fontWeight: 800, height: 22 }}
                        />
                      </Stack>

                      <Divider sx={{ my: 1 }} />

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ color: '#475569' }}>
                          GPS: {w.latitude.toFixed(4)}, {w.longitude.toFixed(4)}
                        </Typography>
                        <Button size="small" variant="text" startIcon={<LocateIcon sx={{ fontSize: 14 }} />} sx={{ fontSize: '0.7rem' }}>
                          Locate
                        </Button>
                      </Stack>
                    </Card>
                  );
                })
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
