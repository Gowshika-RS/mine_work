import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  Stack
} from '@mui/material';
import {
  WbSunny as WeatherIcon,
  Thermostat as TempIcon,
  Air as AQIIcon,
  LocalFireDepartment as GasIcon,
  Opacity as HumidityIcon,
  WaterDrop as WaterIcon
} from '@mui/icons-material';

export default function EnvironmentMonitoring() {
  const envSensors = [
    { name: 'Surface Air Temperature', value: '27.5°C', status: 'Normal', color: '#22c55e', icon: <TempIcon sx={{ color: '#f59e0b', fontSize: 32 }} /> },
    { name: 'Underground Tunnel Temp', value: '23.8°C', status: 'Optimal', color: '#22c55e', icon: <TempIcon sx={{ color: '#38bdf8', fontSize: 32 }} /> },
    { name: 'Methane CH4 Gas Sensor', value: '0.02%', status: 'Safe Threshold (< 1.0%)', color: '#22c55e', icon: <GasIcon sx={{ color: '#22c55e', fontSize: 32 }} /> },
    { name: 'Air Quality Index (AQI)', value: 'AQI 42', status: 'Good Quality', color: '#22c55e', icon: <AQIIcon sx={{ color: '#38bdf8', fontSize: 32 }} /> },
    { name: 'Relative Air Humidity', value: '58%', status: 'Normal Range', color: '#22c55e', icon: <HumidityIcon sx={{ color: '#38bdf8', fontSize: 32 }} /> },
    { name: 'Seepage Water Level Bay 3', value: '12 cm', status: 'Low Risk', color: '#22c55e', icon: <WaterIcon sx={{ color: '#0284c7', fontSize: 32 }} /> },
  ];

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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <WeatherIcon sx={{ fontSize: 36, color: '#f59e0b' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Real-Time Environmental & Sensor Telemetry
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Continuous telemetry monitoring of gas concentrations, air quality, tunnel temperature, and weather safety warnings
              </Typography>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {envSensors.map((s, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="subtitle2" color="#94a3b8" fontWeight="bold">
                    {s.name}
                  </Typography>
                  {s.icon}
                </Box>
                <Typography variant="h3" fontWeight="bold" color="#fff" mb={1}>
                  {s.value}
                </Typography>
                <Chip label={s.status} color="success" size="small" sx={{ fontWeight: 'bold' }} />
              </Card>
            </Grid>
          ))}
        </Grid>

        <Alert severity="success" sx={{ borderRadius: 2 }}>
          ✅ All environmental sensors are online and operating within strict MSHA mine safety standards. Methane gas readings remain below 0.05%.
        </Alert>
      </Paper>
    </Box>
  );
}
