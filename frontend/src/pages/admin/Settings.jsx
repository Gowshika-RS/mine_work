import { Box, Card, CardContent, Typography, TextField, Button, Switch, FormControlLabel, Divider, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useState } from 'react';

export const Settings = () => {
  const [settings, setSettings] = useState({
    appName: 'Safety App',
    adminEmail: 'admin@example.com',
    alertThreshold: 'high',
    enableNotifications: true,
    enableEmailAlerts: true,
    maintenanceMode: false,
    sessionTimeout: 30,
    dataRetention: 365,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    console.log('Settings saved:', settings);
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Settings
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            General Settings
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Application Name"
                name="appName"
                value={settings.appName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Admin Email"
                type="email"
                name="adminEmail"
                value={settings.adminEmail}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Alert Threshold</InputLabel>
                <Select
                  name="alertThreshold"
                  value={settings.alertThreshold}
                  onChange={handleChange}
                  label="Alert Threshold"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Session Timeout (minutes)"
                type="number"
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data Retention (days)"
                type="number"
                name="dataRetention"
                value={settings.dataRetention}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Notification Settings
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableNotifications}
                  onChange={handleChange}
                  name="enableNotifications"
                />
              }
              label="Enable Push Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableEmailAlerts}
                  onChange={handleChange}
                  name="enableEmailAlerts"
                />
              }
              label="Enable Email Alerts"
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            System Settings
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.maintenanceMode}
                onChange={handleChange}
                name="maintenanceMode"
              />
            }
            label="Maintenance Mode"
          />

          <Box sx={{ display: 'flex', gap: 1, mt: 4 }}>
            <Button variant="contained" onClick={handleSave}>
              Save Settings
            </Button>
            <Button variant="outlined">Reset to Default</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
