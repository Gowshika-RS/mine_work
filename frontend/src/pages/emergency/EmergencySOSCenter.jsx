import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, Alert, CircularProgress, IconButton
} from '@mui/material';
import { Emergency, LocalHospital, GpsFixed, CheckCircle, Warning, Campaign, Refresh } from '@mui/icons-material';
import apiClient from '../../api/client';

export const EmergencySOSCenter = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({ team_name: 'Alpha Rescue Squad', responder_notes: '' });
  const [toast, setToast] = useState('');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/sos/alerts');
      setAlerts(res.data || []);
    } catch (err) {
      // Mock fallback data for demonstration
      setAlerts([
        { id: 1042, worker_name: 'John Doe (Worker)', worker_role: 'worker', employee_id: 'EMP-004', department: 'Mining Operations', latitude: 23.795, longitude: 86.430, emergency_type: 'Methane Gas Spike', status: 'active', timestamp: new Date().toISOString() },
        { id: 1041, worker_name: 'Sarah Connor (Worker)', worker_role: 'worker', employee_id: 'EMP-012', department: 'Excavation', latitude: 23.792, longitude: 86.428, emergency_type: 'Injured / Trapped', status: 'acknowledged', timestamp: new Date(Date.now() - 300000).toISOString() },
        { id: 1040, worker_name: 'Mike Ross (Worker)', worker_role: 'worker', employee_id: 'EMP-009', department: 'Haulage', latitude: 23.790, longitude: 86.425, emergency_type: 'Equipment Entrapment', status: 'dispatched', timestamp: new Date(Date.now() - 900000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenDispatch = (alert) => {
    setSelectedAlert(alert);
    setDispatchModalOpen(true);
  };

  const handleDispatchSubmit = async () => {
    if (!selectedAlert) return;
    try {
      await apiClient.post('/emergency-officer/dispatch-rescue', {
        sos_id: selectedAlert.id,
        team_name: dispatchForm.team_name,
        responder_notes: dispatchForm.responder_notes
      });
      setToast(`Rescue Squad '${dispatchForm.team_name}' dispatched to SOS #${selectedAlert.id}!`);
      setDispatchModalOpen(false);
      setDispatchForm({ team_name: 'Alpha Rescue Squad', responder_notes: '' });
      fetchAlerts();
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      alert('Failed to dispatch squad');
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      await apiClient.put(`/sos/${id}/status?status=resolved`);
      setToast(`SOS Alert #${id} marked as RESOLVED.`);
      fetchAlerts();
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      alert('Failed to resolve alert');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#0b0f19', minHeight: '100vh', color: '#f8fafc' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Emergency sx={{ color: '#ef4444', fontSize: 36 }} /> Live SOS Response & Command Center
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Real-time worker distress beacons, GPS location telemetry & rescue unit dispatching
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchAlerts} sx={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.4)' }}>
          Refresh Feeds
        </Button>
      </Box>

      {toast && (
        <Alert severity="success" sx={{ mb: 3, fontWeight: 'bold' }}>{toast}</Alert>
      )}

      <TableContainer component={Card} sx={{ bgcolor: '#151c2c', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }}>
        <Table sx={{ color: '#ffffff' }}>
          <TableHead sx={{ bgcolor: '#1e293b' }}>
            <TableRow>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>ALERT ID</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>WORKER DETAILS</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>EMERGENCY TYPE</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>GPS COORDINATES</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>STATUS</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>TIMESTAMPS</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold', textAlign: 'right' }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress color="error" />
                </TableCell>
              </TableRow>
            ) : alerts.map((row) => (
              <TableRow key={row.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                <TableCell sx={{ color: '#ef4444', fontWeight: '800' }}>#{row.id}</TableCell>
                <TableCell sx={{ color: '#ffffff' }}>
                  <Typography variant="subtitle2" fontWeight="bold">{row.worker_name}</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>ID: {row.employee_id} | {row.department}</Typography>
                </TableCell>
                <TableCell sx={{ color: '#fca5a5', fontWeight: '700' }}>{row.emergency_type}</TableCell>
                <TableCell sx={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                  Lat: {row.latitude}, Lng: {row.longitude}
                </TableCell>
                <TableCell>
                  {row.status === 'active' && <Chip label="ACTIVE DISTRESS" color="error" size="small" sx={{ fontWeight: 'bold' }} />}
                  {row.status === 'acknowledged' && <Chip label="ACKNOWLEDGED" color="warning" size="small" sx={{ fontWeight: 'bold' }} />}
                  {row.status === 'dispatched' && <Chip label="SQUAD DISPATCHED" color="info" size="small" sx={{ fontWeight: 'bold' }} />}
                  {row.status === 'resolved' && <Chip label="RESOLVED" color="success" size="small" sx={{ fontWeight: 'bold' }} />}
                </TableCell>
                <TableCell sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                  {new Date(row.timestamp).toLocaleTimeString()}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {row.status !== 'resolved' && (
                      <Button
                        variant="contained"
                        size="small"
                        color="error"
                        startIcon={<LocalHospital />}
                        onClick={() => handleOpenDispatch(row)}
                        sx={{ fontWeight: 'bold' }}
                      >
                        Dispatch Rescue
                      </Button>
                    )}
                    {row.status !== 'resolved' && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleResolveAlert(row.id)}
                        sx={{ fontWeight: 'bold' }}
                      >
                        Resolve
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dispatch Squad Dialog */}
      <Dialog open={dispatchModalOpen} onClose={() => setDispatchModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#7f1d1d', color: '#ffffff', fontWeight: 'bold' }}>
          Dispatch Rescue Squad to SOS #{selectedAlert?.id}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#0f172a', pt: 3 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
              Target Worker: <strong>{selectedAlert?.worker_name}</strong> | Emergency: <strong>{selectedAlert?.emergency_type}</strong>
            </Typography>

            <TextField
              fullWidth
              label="Rescue Squad Selection"
              value={dispatchForm.team_name}
              onChange={(e) => setDispatchForm({ ...dispatchForm, team_name: e.target.value })}
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rescue Officer Notes & Instructions"
              value={dispatchForm.responder_notes}
              onChange={(e) => setDispatchForm({ ...dispatchForm, responder_notes: e.target.value })}
              placeholder="Provide medical prep or rescue equipment guidance..."
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#0f172a', p: 2 }}>
          <Button onClick={() => setDispatchModalOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDispatchSubmit} sx={{ fontWeight: 'bold' }}>
            CONFIRM DISPATCH SQUAD
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
