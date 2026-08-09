import { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress, Alert, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog,
  DialogTitle, DialogContent, DialogActions, Stack
} from '@mui/material';
import { Emergency, Phone, LocalHospital, NotificationsActive, CheckCircle, Navigation, Refresh } from '@mui/icons-material';
import apiClient from '../../api/client';
import { useNavigate } from 'react-router-dom';

export const SupervisorEmergencyCenter = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const navigate = useNavigate();

  const fetchAlerts = async () => {
    try {
      const res = await apiClient.get('/supervisor/sos-alerts');
      setAlerts(res.data);
      const active = res.data.find(a => a.status === 'active');
      if (active && !popupOpen) {
        setSelectedAlert(active);
        setPopupOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (alertId, action) => {
    try {
      await apiClient.post(`/supervisor/sos-alerts/${alertId}/${action}`);
      fetchAlerts();
      if (action === 'resolve') setPopupOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="error">Emergency & SOS Center</Typography>
          <Typography variant="body2" color="text.secondary">Real-time distress signals, emergency dispatch & rescue management</Typography>
        </Box>
        <Button variant="contained" color="error" startIcon={<Refresh />} onClick={fetchAlerts}>
          Check SOS Stream
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>Worker</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Alert Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.length > 0 ? alerts.map((a) => (
              <TableRow key={a.id} hover sx={{ bgcolor: a.status === 'active' ? 'error.lighter' : 'inherit' }}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {a.worker_name?.includes('(') ? a.worker_name : `${a.worker_name} (${(a.worker_role || 'worker').charAt(0).toUpperCase() + (a.worker_role || 'worker').slice(1)})`}
                    </Typography>
                    <Chip
                      label={(a.worker_role || 'worker').toUpperCase()}
                      size="small"
                      color={a.worker_role === 'admin' ? 'error' : a.worker_role === 'supervisor' ? 'warning' : 'primary'}
                      sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">{a.employee_id}</Typography>
                </TableCell>
                <TableCell>{a.mine_area} ({a.latitude}, {a.longitude})</TableCell>
                <TableCell>{a.timestamp}</TableCell>
                <TableCell><Chip label={a.alert_type} size="small" color="error" /></TableCell>
                <TableCell><Chip label={a.severity.toUpperCase()} size="small" color="error" sx={{ fontWeight: 700 }} /></TableCell>
                <TableCell>
                  <Chip
                    label={a.status.toUpperCase()}
                    color={a.status === 'active' ? 'error' : a.status === 'resolved' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {a.status === 'active' && (
                      <Button size="small" variant="contained" color="warning" onClick={() => handleAction(a.id, 'acknowledge')}>
                        Accept
                      </Button>
                    )}
                    {a.status === 'acknowledged' && (
                      <Button size="small" variant="contained" color="info" onClick={() => handleAction(a.id, 'dispatch')}>
                        Notify Rescue
                      </Button>
                    )}
                    {a.status !== 'resolved' && (
                      <Button size="small" variant="contained" color="success" onClick={() => handleAction(a.id, 'resolve')}>
                        Resolve
                      </Button>
                    )}
                    <Button size="small" variant="outlined" onClick={() => navigate('/supervisor/live-tracking')}>
                      Navigate
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} align="center">No emergency alerts active.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Emergency Popup Modal */}
      <Dialog open={popupOpen} onClose={() => setPopupOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Emergency /> EMERGENCY SOS ALERT TRIGGERED
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {selectedAlert && (
            <Stack spacing={2}>
              <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 2, border: '1px solid', borderColor: 'error.light' }}>
                <Typography variant="h6" fontWeight={800} color="error">{selectedAlert.worker_name}</Typography>
                <Typography variant="body2">{selectedAlert.employee_id} • Area: {selectedAlert.mine_area}</Typography>
                <Typography variant="caption" color="text.secondary">Triggered at: {selectedAlert.timestamp}</Typography>
              </Box>
              <Typography variant="subtitle2" fontWeight={700}>Automated AI Rescue Recommendation:</Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="primary" fontWeight={600}>• Nearest Rescue Team: Squad Alpha (Shaft A)</Typography>
                <Typography variant="body2" color="primary" fontWeight={600}>• Evacuation Route: Emergency Shaft Exit 2</Typography>
                <Typography variant="body2" color="primary" fontWeight={600}>• Estimated Rescue ETA: 3.5 minutes</Typography>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" color="warning" onClick={() => handleAction(selectedAlert?.id, 'acknowledge')}>Accept Alert</Button>
          <Button variant="contained" color="info" onClick={() => handleAction(selectedAlert?.id, 'dispatch')}>Dispatch Rescue</Button>
          <Button variant="contained" color="success" onClick={() => handleAction(selectedAlert?.id, 'resolve')}>Resolve Incident</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
