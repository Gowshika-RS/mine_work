import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Button, Grid,
  Chip, CircularProgress, Alert, Paper, Divider, Stack
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BuildIcon from '@mui/icons-material/Build';
import LandscapeIcon from '@mui/icons-material/Landscape';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import { useSocket } from '../../context/SocketContext';

const EMERGENCY_TYPES = [
  { label: 'Toxic Gas / Ventilation', key: 'Toxic Gas', icon: <WarningIcon />, color: '#ff9800' },
  { label: 'Cave-In / Structural Collapse', key: 'Cave-In', icon: <LandscapeIcon />, color: '#f44336' },
  { label: 'Fire / Explosion', key: 'Fire', icon: <LocalFireDepartmentIcon />, color: '#d32f2f' },
  { label: 'Medical Injury', key: 'Injury', icon: <LocalHospitalIcon />, color: '#e91e63' },
  { label: 'Equipment Failure', key: 'Equipment Failure', icon: <BuildIcon />, color: '#795548' },
  { label: 'General Safety Emergency', key: 'General Emergency', icon: <WarningIcon />, color: '#9c27b0' },
];

export const SOSPage = () => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState('General Emergency');
  const [loading, setLoading] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [gpsLocation, setGpsLocation] = useState({ lat: 12.9716, lon: 77.5946 });
  const [activeSOS, setActiveSOS] = useState(null);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');

  const { socket } = useSocket();

  useEffect(() => {
    // Acquire GPS position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => console.log("GPS fetch info, using mine site defaults:", err)
      );
    }

    fetchSOSState();
  }, []);

  // Listen to real-time WebSocket status updates
  useEffect(() => {
    if (!socket) return;

    const handleSocketMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'sos_status_change' && activeSOS && data.id === activeSOS.id) {
          setActiveSOS(prev => prev ? { ...prev, status: data.status } : null);
          setMessage(`ℹ️ Emergency status updated to: ${data.status.toUpperCase()}`);
          setSeverity(data.status === 'resolved' ? 'success' : 'warning');
        }
      } catch (e) {
        console.error("Failed parsing WS message in SOSPage:", e);
      }
    };

    socket.addEventListener('message', handleSocketMessage);
    return () => {
      socket.removeEventListener('message', handleSocketMessage);
    };
  }, [socket, activeSOS]);

  const fetchSOSState = async () => {
    try {
      const res = await apiClient.get('/sos/active');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setActiveSOS(res.data[0]);
      } else {
        setActiveSOS(null);
      }
    } catch (e) {
      console.log("Error fetching active SOS state:", e);
    }
  };

  const handleTriggerSOS = async () => {
    setLoading(true);
    setMessage('');
    
    const payload = {
      latitude: parseFloat(gpsLocation.lat || 12.9716),
      longitude: parseFloat(gpsLocation.lon || 77.5946),
      alert_type: "SOS_TRIGGERED",
      emergency_type: selectedType || "General Emergency"
    };

    try {
      let res;
      try {
        res = await apiClient.post('/emergency/sos', payload);
      } catch (err1) {
        // Fallback to /sos/trigger
        res = await apiClient.post('/sos/trigger', payload);
      }

      setActiveSOS(res.data);
      setMessage("🚨 SOS Emergency Distress Beacon Dispatched to Control Room & Supervisors!");
      setSeverity('error');

      if (navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }
    } catch (err) {
      console.error("SOS Trigger error:", err);
      const detail = err.response?.data?.detail;
      let errorMsg = "An error occurred while transmitting SOS alert.";
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail)) {
        errorMsg = detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
      } else if (err.message) {
        errorMsg = err.message;
      }
      setMessage(`Failed to trigger SOS: ${errorMsg}`);
      setSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveSOS = async () => {
    if (!activeSOS) return;
    setResolveLoading(true);
    try {
      const res = await apiClient.put(`/sos/${activeSOS.id}/status`, { status: 'resolved' });
      setActiveSOS(null);
      setMessage("✅ Emergency status resolved and distress beacon deactivated.");
      setSeverity('success');
    } catch (err) {
      console.error("Failed to deactivate SOS:", err);
      setMessage("Could not update SOS status. Please contact supervisor directly.");
      setSeverity('warning');
    } finally {
      setResolveLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="900" color="error.main" gutterBottom>
          🚨 {t('sos.title') || 'EMERGENCY SOS CENTER'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" fontWeight="500">
          {t('sos.subtitle') || 'Instant underground distress beacon with GPS locking & Control Room dispatch.'}
        </Typography>
      </Box>

      {message && (
        <Alert severity={severity} sx={{ mb: 3, fontWeight: 'bold', borderRadius: 3 }}>
          {message}
        </Alert>
      )}

      {/* Active Emergency Card */}
      {activeSOS && (
        <Card sx={{ mb: 4, borderLeft: '8px solid #f44336', bgcolor: '#fff5f5', borderRadius: 3, boxShadow: 6 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="error">
                  🚨 Active Distress Beacon #{activeSOS.id}
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold" color="text.primary" sx={{ mt: 0.5 }}>
                  Triggered by: {activeSOS.worker_name || 'Worker'}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Emergency Type: <strong>{activeSOS.emergency_type}</strong> | GPS: <strong>({activeSOS.latitude}, {activeSOS.longitude})</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Trigger Time: {activeSOS.timestamp}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Chip
                  icon={activeSOS.status === 'resolved' ? <CheckCircleIcon /> : <AccessTimeIcon />}
                  label={`STATUS: ${(activeSOS.status || 'ACTIVE').toUpperCase()}`}
                  color={activeSOS.status === 'resolved' ? 'success' : activeSOS.status === 'acknowledged' ? 'warning' : 'error'}
                  sx={{ fontSize: '1rem', py: 2.5, px: 2, fontWeight: 'bold' }}
                />

                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  disabled={resolveLoading}
                  startIcon={resolveLoading ? <CircularProgress size={16} /> : <CancelIcon />}
                  onClick={handleResolveSOS}
                  sx={{ fontWeight: 'bold', borderRadius: 2 }}
                >
                  Clear SOS
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary" fontWeight="500">
              救援团队和监督员已收到警报 (Rescue operations notified). Control room telemetry connection is active.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={4}>
        {/* Left Panel: Trigger Selector */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              1. Select Emergency Category
            </Typography>

            <Grid container spacing={2} sx={{ my: 1 }}>
              {EMERGENCY_TYPES.map((type) => (
                <Grid item xs={12} sm={6} key={type.key}>
                  <Card
                    onClick={() => setSelectedType(type.key)}
                    sx={{
                      cursor: 'pointer',
                      border: selectedType === type.key ? `3px solid ${type.color}` : '1px solid #e0e0e0',
                      bgcolor: selectedType === type.key ? `${type.color}15` : 'background.paper',
                      transition: 'all 0.2s ease',
                      '&:hover': { transform: 'scale(1.02)' }
                    }}
                  >
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                      <Box sx={{ color: type.color, display: 'flex' }}>
                        {type.icon}
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {type.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              2. Real-Time Geolocation Lock
            </Typography>

            <Box display="flex" alignItems="center" gap={1} sx={{ color: 'text.secondary', mb: 3 }}>
              <MyLocationIcon color="primary" />
              <Typography variant="body2">
                Latitude: <strong>{Number(gpsLocation.lat).toFixed(6)}</strong> | Longitude: <strong>{Number(gpsLocation.lon).toFixed(6)}</strong> (GPS Lock)
              </Typography>
            </Box>

            {/* BIG SOS TRIGGER BUTTON */}
            <Box textAlign="center">
              <Button
                variant="contained"
                color="error"
                disabled={loading}
                onClick={handleTriggerSOS}
                sx={{
                  width: '100%',
                  py: 3,
                  borderRadius: 4,
                  fontSize: '1.8rem',
                  fontWeight: '900',
                  letterSpacing: 2,
                  boxShadow: '0 8px 25px rgba(244, 67, 54, 0.5)',
                  background: 'linear-gradient(45deg, #d32f2f 30%, #ff1744 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #b71c1c 30%, #d32f2f 90%)',
                  }
                }}
              >
                {loading ? <CircularProgress color="inherit" size={32} /> : `ACTIVATE SOS ALERT`}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel: Emergency Protocol */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, bgcolor: '#fafafa' }}>
            <Typography variant="h6" fontWeight="bold" color="error.main" gutterBottom>
              Emergency Response Protocol
            </Typography>

            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box display="flex" gap={2}>
                <Typography fontWeight="bold" color="primary">1.</Typography>
                <Typography variant="body2">Pressing the SOS button instantly pings the <strong>Supervisor Dashboard</strong> and <strong>Admin Emergency Center</strong> via high-priority WebSockets.</Typography>
              </Box>
              <Box display="flex" gap={2}>
                <Typography fontWeight="bold" color="primary">2.</Typography>
                <Typography variant="body2">Stay in place if safe, or proceed to the nearest designated <strong>Emergency Assembly Refuge Chamber</strong>.</Typography>
              </Box>
              <Box display="flex" gap={2}>
                <Typography fontWeight="bold" color="primary">3.</Typography>
                <Typography variant="body2">The emergency status will update automatically from <strong>Pending</strong> to <strong>Acknowledged</strong> to <strong>Resolved</strong> in real time without refreshing.</Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Direct Control Room Hotline
            </Typography>
            <Typography variant="h5" color="secondary" fontWeight="bold">
              📞 +91 1800-MINE-SAFE (Ext. 911)
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SOSPage;
