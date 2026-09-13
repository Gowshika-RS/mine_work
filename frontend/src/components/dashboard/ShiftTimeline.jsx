import React from 'react';
import { Box, Paper, Typography, Stack, Chip, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ShieldIcon from '@mui/icons-material/Shield';
import SensorsIcon from '@mui/icons-material/Sensors';

export const ShiftTimeline = () => {
  const events = [
    { time: '08:00 AM', title: 'Shift Check-In', desc: 'Camera verification completed', icon: <CameraAltIcon fontSize="small" /> },
    { time: '08:15 AM', title: 'Safety Checklist', desc: 'All required items verified', icon: <AssignmentTurnedInIcon fontSize="small" /> },
    { time: '09:30 AM', title: 'AI Hazard Inspection', desc: 'Sector B scanned', icon: <ShieldIcon fontSize="small" /> },
    { time: '11:00 AM', title: 'Telemetry Update', desc: 'Environmental monitoring active', icon: <SensorsIcon fontSize="small" /> },
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
          TODAY'S SAFETY TIMELINE
        </Typography>
        <Chip icon={<AccessTimeIcon fontSize="small" />} label="Shift 1 Operations" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
      </Box>

      <Stack spacing={2} sx={{ position: 'relative', pl: 1 }}>
        {events.map((ev, index) => (
          <Box key={ev.time} display="flex" gap={2} alignItems="flex-start">
            <Chip
              label={ev.time}
              size="small"
              sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 800, minWidth: 80, fontSize: '0.72rem' }}
            />

            <Box sx={{ flexGrow: 1 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
                <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#0f172a' }}>
                  {ev.title}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 3.2 }}>
                {ev.desc}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default ShiftTimeline;
