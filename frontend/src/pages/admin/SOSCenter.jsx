import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { Emergency, LocationOn, Phone, LocalHospital, CheckCircle, Refresh } from '@mui/icons-material';
import apiClient from '../../api/client';

export const SOSCenter = () => {
  const [sosAlerts, setSOSAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [dispatchNote, setDispatchNote] = useState('');

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const loadSOSAlerts = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/admin/sos');
      setSOSAlerts(response.data || []);
    } catch (err) {
      if (!isSilent) setError(err.response?.data?.detail || 'Unable to fetch active SOS emergency alerts');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadSOSAlerts();

    const interval = setInterval(() => {
      loadSOSAlerts(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (id) => {
    try {
      await apiClient.put(`/admin/sos/${id}/acknowledge`);
      setToast({ open: true, message: 'SOS Alert acknowledged', severity: 'success' });
      loadSOSAlerts();
    } catch (err) {
      setToast({ open: true, message: 'Failed to acknowledge alert', severity: 'error' });
    }
  };

  const handleOpenDispatch = (alert) => {
    setSelectedAlert(alert);
    setDispatchNote('');
    setDispatchDialogOpen(true);
  };

  const handleConfirmDispatch = async () => {
    if (!selectedAlert) return;
    try {
      await apiClient.put(`/admin/sos/${selectedAlert.id}/dispatch?details=${encodeURIComponent(dispatchNote)}`);
      setToast({ open: true, message: 'Emergency Rescue Team Dispatched!', severity: 'success' });
      setDispatchDialogOpen(false);
      loadSOSAlerts();
    } catch (err) {
      setToast({ open: true, message: 'Failed to dispatch rescue team', severity: 'error' });
    }
  };

  const handleResolve = async (id) => {
    try {
      await apiClient.put(`/admin/sos/${id}/resolve`);
      setToast({ open: true, message: 'SOS Emergency Incident Resolved', severity: 'success' });
      loadSOSAlerts();
    } catch (err) {
      setToast({ open: true, message: 'Failed to resolve incident', severity: 'error' });
    }
  };

  const activeAlertsCount = sosAlerts.filter((a) => a.status === 'active' || a.status === 'acknowledged').length;

  if (loading) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={44} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            SOS Emergency Control Center
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Live distress monitoring, emergency team dispatches, and incident resolution tracking
          </Typography>
        </Box>
        <Button startIcon={<Refresh />} variant="outlined" onClick={loadSOSAlerts}>
          Refresh SOS Feed
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* SOS Active Banner Card */}
      <Box sx={{ mb: 3 }}>
        <Card sx={{ backgroundColor: activeAlertsCount > 0 ? 'error.light' : 'success.dark', color: 'white', p: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
            <Emergency sx={{ fontSize: 42 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Active Emergency Calls: {activeAlertsCount}
              </Typography>
              <Typography variant="body2">
                {activeAlertsCount > 0
                  ? 'CRITICAL ALERT: Emergency signals require immediate triage and dispatch.'
                  : 'All emergency channels are clear. System monitoring operational.'}
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* SOS Alerts Table */}
      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
            <TableRow>
              <TableCell>Worker & ID</TableCell>
              <TableCell>Location / Mine Sector</TableCell>
              <TableCell>Emergency Contact</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Emergency Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sosAlerts.map((alert) => (
              <TableRow
                key={alert.id}
                sx={{
                  backgroundColor:
                    alert.status === 'active'
                      ? 'rgba(239, 68, 68, 0.08)'
                      : alert.status === 'dispatched'
                      ? 'rgba(245, 158, 11, 0.08)'
                      : 'inherit',
                }}
              >
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {alert.worker_name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    ID: {alert.employee_id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn color="error" fontSize="small" />
                    <Typography variant="body2">{alert.location}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone color="action" fontSize="small" />
                    <Typography variant="body2">{alert.emergency_contact}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{alert.timestamp}</TableCell>
                <TableCell>
                  <Chip
                    label={alert.status.toUpperCase()}
                    color={
                      alert.status === 'active'
                        ? 'error'
                        : alert.status === 'acknowledged'
                        ? 'info'
                        : alert.status === 'dispatched'
                        ? 'warning'
                        : 'success'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {alert.status === 'active' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="info"
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    {alert.status !== 'resolved' && alert.status !== 'dispatched' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="warning"
                        startIcon={<LocalHospital />}
                        onClick={() => handleOpenDispatch(alert)}
                      >
                        Dispatch Rescue
                      </Button>
                    )}
                    {alert.status !== 'resolved' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleResolve(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                    {alert.status === 'resolved' && (
                      <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
                        Resolved at {alert.resolved_at}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {sosAlerts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No active or historical SOS distress calls recorded.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dispatch Emergency Personnel Modal */}
      <Dialog open={dispatchDialogOpen} onClose={() => setDispatchDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dispatch Emergency Rescue Personnel</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selectedAlert && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" color="textSecondary">
                Target Worker: <b>{selectedAlert.worker_name}</b> ({selectedAlert.location})
              </Typography>
              <TextField
                label="Rescue Dispatch Instructions & Medical Notes"
                multiline
                rows={3}
                fullWidth
                placeholder="Enter dispatch notes, team assignments, or medical priority instructions..."
                value={dispatchNote}
                onChange={(e) => setDispatchNote(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDispatchDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDispatch}>
            Confirm Emergency Dispatch
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};
