import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  Chip,
  Alert
} from '@mui/material';
import { WbSunny as WeatherIcon, Thermostat as TempIcon, LocalFireDepartment as GasIcon, Air as AQIIcon } from '@mui/icons-material';

export default function SupervisorEnvironment() {
  return (
    <Box sx={{ py: 2, maxWidth: 1100, mx: 'auto' }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          border: '1px solid #334155'
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
          <WeatherIcon sx={{ fontSize: 36, color: '#f59e0b' }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Sector Environmental Telemetry & Weather Warnings
            </Typography>
            <Typography variant="body2" color="#94a3b8">
              Live environmental conditions and sensor readings for assigned mining sectors
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2 }}>
              <Typography variant="caption" color="#94a3b8">SURFACE TEMP</Typography>
              <Typography variant="h4" fontWeight="bold" color="#fff" my={0.5}>27.2°C</Typography>
              <Chip label="Normal" color="success" size="small" />
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2 }}>
              <Typography variant="caption" color="#94a3b8">METHANE (CH4)</Typography>
              <Typography variant="h4" fontWeight="bold" color="#4ade80" my={0.5}>0.02%</Typography>
              <Chip label="Safe Level (< 1.0%)" color="success" size="small" />
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2 }}>
              <Typography variant="caption" color="#94a3b8">AIR QUALITY</Typography>
              <Typography variant="h4" fontWeight="bold" color="#38bdf8" my={0.5}>AQI 42</Typography>
              <Chip label="Good Quality" color="info" size="small" />
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2 }}>
              <Typography variant="caption" color="#94a3b8">TUNNEL HUMIDITY</Typography>
              <Typography variant="h4" fontWeight="bold" color="#cbd5e1" my={0.5}>56%</Typography>
              <Chip label="Optimal" color="success" size="small" />
            </Card>
          </Grid>
        </Grid>

        <Alert severity="success" sx={{ borderRadius: 2 }}>
          🟢 Sector atmospheric sensors report stable ventilation and safe methane thresholds.
        </Alert>
      </Paper>
    </Box>
  );
}
