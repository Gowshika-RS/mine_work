import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Button, CircularProgress, Paper, Avatar, Stack } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { GpsFixed, Warning, LocalHospital, ExitToApp, Shield, Refresh } from '@mui/icons-material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import apiClient from '../../api/client';

// Fix leafet marker icon issue in react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const SupervisorLiveTracking = () => {
  const [locations, setLocations] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      const res = await apiClient.get('/supervisor/worker-locations');
      setLocations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 5000);
    return () => clearInterval(interval);
  }, []);

  const mineCenter = [20.5937, 78.9629];

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary">Live Tracking & Map</Typography>
          <Typography variant="body2" color="text.secondary">Real-time worker locations, hazard zones & rescue routes</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchLocations}>Refresh Map</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 600, borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <MapContainer center={mineCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {/* Safe & Restricted Zones */}
                <Circle center={[20.5937, 78.9629]} radius={800} pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.1 }} />
                <Circle center={[20.6137, 78.9829]} radius={500} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }} />

                {locations.map((w) => (
                  <Marker
                    key={w.worker_id}
                    position={[w.latitude, w.longitude]}
                    eventHandlers={{ click: () => setSelectedWorker(w) }}
                  >
                    <Popup>
                      <Typography variant="subtitle2" fontWeight={700}>{w.worker_name}</Typography>
                      <Typography variant="caption" display="block">Task: {w.current_task}</Typography>
                      <Typography variant="caption" display="block">Safety Score: {w.safety_score}</Typography>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: 600, borderRadius: 3, border: '1px solid', borderColor: 'divider', overflowY: 'auto' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Worker Details</Typography>
              {selectedWorker ? (
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                      {selectedWorker.worker_name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>{selectedWorker.worker_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{selectedWorker.employee_id} • {selectedWorker.department}</Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={`Risk Level: ${selectedWorker.risk_level.toUpperCase()}`}
                    color={selectedWorker.risk_level === 'emergency' ? 'error' : selectedWorker.risk_level === 'high' ? 'warning' : 'success'}
                  />

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}><Typography variant="caption" color="text.secondary">Heart Rate</Typography><Typography variant="body2" fontWeight={600}>{selectedWorker.heart_rate} bpm</Typography></Grid>
                      <Grid item xs={6}><Typography variant="caption" color="text.secondary">Gas Exposure</Typography><Typography variant="body2" fontWeight={600}>{selectedWorker.gas_exposure} ppm</Typography></Grid>
                      <Grid item xs={6}><Typography variant="caption" color="text.secondary">Safety Score</Typography><Typography variant="body2" fontWeight={600}>{selectedWorker.safety_score}/100</Typography></Grid>
                      <Grid item xs={6}><Typography variant="caption" color="text.secondary">Current Task</Typography><Typography variant="body2" fontWeight={600}>{selectedWorker.current_task}</Typography></Grid>
                    </Grid>
                  </Paper>

                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">Evacuation Assistance</Typography>
                    <Typography variant="body2" fontWeight={600} color="primary">Nearest Exit: Shaft A Emergency Hatch</Typography>
                    <Typography variant="caption" color="text.secondary">Estimated Evacuation Time: 4 mins</Typography>
                  </Box>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">Click on a worker marker on the map to inspect location & safety parameters.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
