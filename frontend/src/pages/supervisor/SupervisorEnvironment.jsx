import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Grid, Card, Chip, Alert, Button, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { WbSunny as WeatherIcon, Thermostat as TempIcon, LocalFireDepartment as GasIcon, Air as AQIIcon, Refresh, Edit } from '@mui/icons-material';
import apiClient from '../../api/client';

export default function SupervisorEnvironment() {
  const [telemetry, setTelemetry] = useState({
    surface_temp: 27.2,
    methane: 0.02,
    co: 18,
    aqi: 42,
    humidity: 56,
    o2: 20.9
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ surface_temp: 27.2, methane: 0.02, co: 18, aqi: 42, humidity: 56 });
  const [toast, setToast] = useState('');

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/supervisor/environment');
      if (res.data) {
        setTelemetry(res.data);
        setEditForm(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveTelemetry = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/supervisor/environment/update', editForm);
      setToast('Live environmental telemetry updated successfully.');
      setModalOpen(false);
      fetchTelemetry();
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      alert('Failed to update telemetry');
    }
  };

  return (
    <Box sx={{ py: 2, maxWidth: 1100, mx: 'auto' }}>
      <Paper
        elevation={3}
        sx={{
          p: 3, borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff', border: '1px solid #334155'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <WeatherIcon sx={{ fontSize: 36, color: '#f59e0b' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Sector Environmental Telemetry & Real-Time Sensors
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Live atmospheric telemetry streams, toxic gas levels, and ventilation monitor controls
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={fetchTelemetry} sx={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.4)' }}>
              Sync Telemetry
            </Button>
            <Button variant="contained" startIcon={<Edit />} onClick={() => setModalOpen(true)} sx={{ bgcolor: '#f59e0b', color: '#0f172a', fontWeight: 'bold' }}>
              Adjust Telemetry Sensors
            </Button>
          </Stack>
        </Box>

        {toast && <Alert severity="success" sx={{ mb: 2, fontWeight: 'bold' }}>{toast}</Alert>}

        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2 }}>
              <Typography variant="caption" color="#94a3b8">SURFACE TEMP</Typography>
              <Typography variant="h4" fontWeight="bold" color="#fff" my={0.5}>{telemetry.surface_temp}°C</Typography>
              <Chip label={telemetry.surface_temp > 35 ? 'High Temp' : 'Normal'} color={telemetry.surface_temp > 35 ? 'warning' : 'success'} size="small" />
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2 }}>
              <Typography variant="caption" color="#94a3b8">METHANE (CH4)</Typography>
              <Typography variant="h4" fontWeight="bold" color={telemetry.methane >= 1.0 ? '#f87171' : '#4ade80'} my={0.5}>
                {telemetry.methane}%
              </Typography>
              <Chip label={telemetry.methane >= 1.0 ? 'CRITICAL (> 1.0%)' : 'Safe Level (< 1.0%)'} color={telemetry.methane >= 1.0 ? 'error' : 'success'} size="small" />
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2 }}>
              <Typography variant="caption" color="#94a3b8">CARBON MONOXIDE (CO)</Typography>
              <Typography variant="h4" fontWeight="bold" color={telemetry.co >= 35 ? '#f87171' : '#38bdf8'} my={0.5}>
                {telemetry.co} PPM
              </Typography>
              <Chip label={telemetry.co >= 35 ? 'WARNING LEVEL' : 'Good Quality'} color={telemetry.co >= 35 ? 'error' : 'info'} size="small" />
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2 }}>
              <Typography variant="caption" color="#94a3b8">TUNNEL HUMIDITY</Typography>
              <Typography variant="h4" fontWeight="bold" color="#cbd5e1" my={0.5}>{telemetry.humidity}%</Typography>
              <Chip label="Optimal" color="success" size="small" />
            </Card>
          </Grid>
        </Grid>

        {telemetry.methane >= 1.0 || telemetry.co >= 35 ? (
          <Alert severity="error" sx={{ borderRadius: 2, fontWeight: 'bold' }}>
            🚨 WARNING: Hazardous atmospheric telemetry detected in underground sectors!
          </Alert>
        ) : (
          <Alert severity="success" sx={{ borderRadius: 2, fontWeight: 'bold' }}>
            🟢 Sector atmospheric sensors report stable ventilation and safe methane thresholds.
          </Alert>
        )}
      </Paper>

      {/* Adjust Telemetry Dialog */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1e293b', color: '#ffffff', fontWeight: 'bold' }}>
          Adjust Telemetry Sensor Readings
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#0f172a', pt: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              type="number"
              label="Methane CH4 (%)"
              value={editForm.methane}
              onChange={(e) => setEditForm({ ...editForm, methane: e.target.value })}
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
            <TextField
              fullWidth
              type="number"
              label="Carbon Monoxide CO (PPM)"
              value={editForm.co}
              onChange={(e) => setEditForm({ ...editForm, co: e.target.value })}
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
            <TextField
              fullWidth
              type="number"
              label="Surface Temp (°C)"
              value={editForm.surface_temp}
              onChange={(e) => setEditForm({ ...editForm, surface_temp: e.target.value })}
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
            <TextField
              fullWidth
              type="number"
              label="Tunnel Humidity (%)"
              value={editForm.humidity}
              onChange={(e) => setEditForm({ ...editForm, humidity: e.target.value })}
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#0f172a', p: 2 }}>
          <Button onClick={() => setModalOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTelemetry} sx={{ bgcolor: '#f59e0b', color: '#0f172a', fontWeight: 'bold' }}>
            Update Sensors
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
