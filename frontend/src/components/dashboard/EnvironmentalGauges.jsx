import React from 'react';
import { Box, Paper, Typography, LinearProgress, Stack, Grid, Chip } from '@mui/material';
import GasMeterIcon from '@mui/icons-material/GasMeter';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import ShieldIcon from '@mui/icons-material/Shield';

export const EnvironmentalGauges = ({ weather }) => {
  const temp = weather?.temperature || 26.3;
  const humidity = weather?.humidity || 72;

  const metrics = [
    { label: 'CH₄ (Methane)', value: '0.2%', status: 'Safe', progress: 12, color: '#10b981', icon: <GasMeterIcon fontSize="small" /> },
    { label: 'CO (Carbon Monoxide)', value: '5 ppm', status: 'Normal', progress: 8, color: '#10b981', icon: <GasMeterIcon fontSize="small" /> },
    { label: 'Temperature', value: `${temp}°C`, status: temp > 32 ? 'Elevated' : 'Safe', progress: Math.min((temp / 50) * 100, 100), color: temp > 32 ? '#f59e0b' : '#3b82f6', icon: <ThermostatIcon fontSize="small" /> },
    { label: 'Humidity', value: `${humidity}%`, status: 'Optimal', progress: humidity, color: '#0284c7', icon: <WaterDropIcon fontSize="small" /> },
    { label: 'Air Velocity', value: '3.5 m/s', status: 'Optimal Flow', progress: 70, color: '#8b5cf6', icon: <AirIcon fontSize="small" /> },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        height: '100%',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: '#64748b' }}>
          ENVIRONMENTAL SAFETY MONITORING
        </Typography>
        <Chip label="Telemetry Live 🟢" size="small" variant="outlined" sx={{ fontWeight: 'bold', fontSize: '0.72rem' }} />
      </Box>

      <Stack spacing={2}>
        {metrics.map((item) => (
          <Box key={item.label}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ color: item.color, display: 'flex' }}>{item.icon}</Box>
                <Typography variant="body2" fontWeight="700" sx={{ color: '#1e293b' }}>
                  {item.label}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" fontWeight="900" sx={{ color: '#0f172a' }}>
                  {item.value}
                </Typography>
                <Chip
                  label={item.status}
                  size="small"
                  sx={{
                    bgcolor: `${item.color}15`,
                    color: item.color,
                    fontWeight: 'bold',
                    fontSize: '0.68rem',
                    height: 20
                  }}
                />
              </Stack>
            </Box>
            <LinearProgress
              variant="determinate"
              value={item.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#f1f5f9',
                '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 4 }
              }}
            />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default EnvironmentalGauges;
