import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import apiClient from '../../api/client';

export const Settings = () => {
  const [settings, setSettings] = useState({
    app_name: 'MineGuard - AI Offline Safety Companion',
    admin_email: 'admin@mineguard.com',
    alert_threshold: 'high',
    enable_notifications: 'true',
    enable_email_alerts: 'true',
    maintenance_mode: 'false',
    session_timeout: '60',
    data_retention_days: '365',
    language: 'en',
    theme_mode: 'dark',
    ai_model: 'Gemini 1.5 Pro / Flash Safety Engine',
    emergency_phone: '+1-800-MINE-SAFE',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/admin/settings');
      setSettings(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to fetch system configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put('/admin/settings', settings);
      setToast({ open: true, message: 'Settings saved to MySQL database successfully!', severity: 'success' });
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.detail || 'Failed to save settings', severity: 'error' });
    } finally {
      setSaving(false);
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
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        System & AI Configuration
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card>
        <CardContent>
          {/* General Application Settings */}
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
            General Application Settings
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Application Title"
                name="app_name"
                value={settings.app_name || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Admin Contact Email"
                type="email"
                name="admin_email"
                value={settings.admin_email || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Hotline Phone Number"
                name="emergency_phone"
                value={settings.emergency_phone || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Default Language</InputLabel>
                <Select
                  name="language"
                  value={settings.language || 'en'}
                  onChange={handleChange}
                  label="Default Language"
                >
                  <MenuItem value="en">English (US)</MenuItem>
                  <MenuItem value="es">Spanish (Español)</MenuItem>
                  <MenuItem value="hi">Hindi (हिन्दी)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* AI Engine & Risk Configuration */}
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
            Gemini AI Engine & Risk Calibration
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="AI Model Engine"
                name="ai_model"
                value={settings.ai_model || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Alert Sensitivity Threshold</InputLabel>
                <Select
                  name="alert_threshold"
                  value={settings.alert_threshold || 'high'}
                  onChange={handleChange}
                  label="Alert Sensitivity Threshold"
                >
                  <MenuItem value="low">Low Sensitivity</MenuItem>
                  <MenuItem value="medium">Medium Sensitivity</MenuItem>
                  <MenuItem value="high">High Sensitivity (Recommended)</MenuItem>
                  <MenuItem value="critical">Critical Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="JWT Session Timeout (minutes)"
                type="number"
                name="session_timeout"
                value={settings.session_timeout || '60'}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Audit & Incident Retention (days)"
                type="number"
                name="data_retention_days"
                value={settings.data_retention_days || '365'}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Notification & Dispatch Settings */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Notification & System Alerts
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enable_notifications === 'true'}
                  onChange={handleChange}
                  name="enable_notifications"
                />
              }
              label="Enable Real-Time Push & WebSocket Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enable_email_alerts === 'true'}
                  onChange={handleChange}
                  name="enable_email_alerts"
                />
              }
              label="Enable Automatic SOS Email & SMS Alerts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.maintenance_mode === 'true'}
                  onChange={handleChange}
                  name="maintenance_mode"
                />
              }
              label="System Maintenance Mode (Restricts Worker Logins)"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving Settings...' : 'Save Configuration'}
            </Button>
            <Button variant="outlined" size="large" onClick={loadSettings}>
              Reset Changes
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};
