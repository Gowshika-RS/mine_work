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
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Snackbar,
} from '@mui/material';
import { Send, Delete, MarkEmailRead, Campaign } from '@mui/icons-material';
import apiClient from '../../api/client';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'safety_alert',
    category: 'Announcement',
    priority: 'info',
    target_role: 'all',
  });

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/admin/notifications');
      setNotifications(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to fetch system notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSendNotification = async () => {
    if (!formData.title || !formData.message) {
      setToast({ open: true, message: 'Title and message are required', severity: 'error' });
      return;
    }
    try {
      const res = await apiClient.post('/admin/notifications', formData);
      setToast({ open: true, message: res.data.message || 'Notification broadcasted successfully', severity: 'success' });
      setCreateDialogOpen(false);
      setFormData({ title: '', message: '', type: 'safety_alert', category: 'Announcement', priority: 'info', target_role: 'all' });
      loadNotifications();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.detail || 'Failed to send notification', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/admin/notifications/${id}`);
      setToast({ open: true, message: 'Notification deleted', severity: 'success' });
      loadNotifications();
    } catch (err) {
      setToast({ open: true, message: 'Failed to delete notification', severity: 'error' });
    }
  };

  const handleToggleRead = async (id) => {
    try {
      await apiClient.patch(`/admin/notifications/${id}/read`);
      loadNotifications();
    } catch (err) {
      console.error('Failed to toggle read state:', err);
    }
  };

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
            Notifications & Announcements Center
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Broadcast emergency alerts, shift reminders, and safety notices to workers and supervisors
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Send />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Send Announcement
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Notifications Table */}
      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
            <TableRow>
              <TableCell>Title & Type</TableCell>
              <TableCell>Message Body</TableCell>
              <TableCell>Target Recipient</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications.map((n) => (
              <TableRow key={n.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Campaign color={n.type === 'emergency_instruction' ? 'error' : 'primary'} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {n.title}
                    </Typography>
                  </Box>
                  <Chip
                    label={n.type.replace('_', ' ').toUpperCase()}
                    size="small"
                    color={n.type === 'emergency_instruction' ? 'error' : 'info'}
                    sx={{ mt: 0.5 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 300 }}>
                    {n.message}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{n.recipient_name}</Typography>
                  <Typography variant="caption" color="textSecondary">Role: {n.recipient_role}</Typography>
                </TableCell>
                <TableCell>{n.created_at}</TableCell>
                <TableCell>
                  <Chip
                    label={n.is_read ? 'Read' : 'Unread'}
                    color={n.is_read ? 'default' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <IconButton size="small" color="primary" title="Toggle Read/Unread" onClick={() => handleToggleRead(n.id)}>
                      <MarkEmailRead fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" title="Delete Notification" onClick={() => handleDelete(n.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {notifications.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No broadcast notifications sent yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Announcement Modal */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Broadcast Notification / Safety Announcement</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Announcement Title"
            required
            fullWidth
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextField
            label="Message Body"
            required
            multiline
            rows={4}
            fullWidth
            placeholder="Type your safety alert or announcement instructions..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              label="Category"
            >
              <MenuItem value="Announcement">General Announcement</MenuItem>
              <MenuItem value="Safety Directive">Safety Directive</MenuItem>
              <MenuItem value="Hazard Advisory">Hazard Advisory</MenuItem>
              <MenuItem value="Shift Notice">Shift Notice</MenuItem>
              <MenuItem value="Emergency Alert">Emergency Alert</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Priority Level</InputLabel>
            <Select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              label="Priority Level"
            >
              <MenuItem value="info">Info / Normal</MenuItem>
              <MenuItem value="warning">Warning / Elevated</MenuItem>
              <MenuItem value="critical">Critical / Severe</MenuItem>
              <MenuItem value="emergency">EMERGENCY SOS</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Notification Type</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              label="Notification Type"
            >
              <MenuItem value="safety_alert">Standard Safety Alert</MenuItem>
              <MenuItem value="emergency_instruction">EMERGENCY CRITICAL INSTRUCTION</MenuItem>
              <MenuItem value="shift_reminder">Shift Reminder</MenuItem>
              <MenuItem value="hazard_warning">Hazard Warning</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Target Audience</InputLabel>
            <Select
              value={formData.target_role}
              onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
              label="Target Audience"
            >
              <MenuItem value="all">Broadcast to Everyone (All Users)</MenuItem>
              <MenuItem value="worker">All Mine Workers</MenuItem>
              <MenuItem value="supervisor">All Site Supervisors</MenuItem>
              <MenuItem value="emergency">Emergency Response Personnel</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" endIcon={<Send />} onClick={handleSendNotification}>
            Broadcast Now
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
