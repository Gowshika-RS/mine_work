import React from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChecklistIcon from '@mui/icons-material/Checklist';
import WarningIcon from '@mui/icons-material/Warning';
import FactCheckIcon from '@mui/icons-material/FactCheck';

import MapIcon from '@mui/icons-material/Map';
import BuildIcon from '@mui/icons-material/Build';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

import EmergencyIcon from '@mui/icons-material/Emergency';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const CategorizedModuleCatalog = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: 'SAFETY',
      color: '#38bdf8',
      modules: [
        { title: 'PPE Verification', desc: 'Verify helmet, respirator & boots compliance.', path: '/worker/ppe', icon: <HealthAndSafetyIcon sx={{ color: '#38bdf8' }} /> },
        { title: 'Personal Safety Score', desc: 'Track risk metrics & personal safety index.', path: '/worker/safety-score', icon: <BarChartIcon sx={{ color: '#10b981' }} /> },
        { title: 'Safety Checklist', desc: 'Log mandatory pre-shift gear verification.', path: '/worker/checklist', icon: <ChecklistIcon sx={{ color: '#14b8a6' }} /> },
        { title: 'AI Hazard Reporting', desc: 'Vision AI scan for cracks, gas & leaks.', path: '/worker/ai-hazards', icon: <WarningIcon sx={{ color: '#f59e0b' }} /> },
        { title: 'Incident History', desc: 'Review historical sector incident reports.', path: '/worker/incident-history', icon: <FactCheckIcon sx={{ color: '#ec4899' }} /> },
      ]
    },
    {
      name: 'OPERATIONS',
      color: '#8b5cf6',
      modules: [
        { title: 'Safe Zone Navigation', desc: 'Interactive mine map & evacuation routes.', path: '/worker/map', icon: <MapIcon sx={{ color: '#8b5cf6' }} /> },
        { title: 'Equipment Issues', desc: 'Report machine faults & request maintenance.', path: '/worker/equipment-reporting', icon: <BuildIcon sx={{ color: '#eab308' }} /> },
        { title: 'Shift Monitoring', desc: 'Track active shift hours & rest break alerts.', path: '/worker/shift', icon: <ScheduleIcon sx={{ color: '#0284c7' }} /> },
        { title: 'Camera Attendance', desc: 'Selfie face check-in with streak verification.', path: '/worker/attendance', icon: <CameraAltIcon sx={{ color: '#10b981' }} /> },
        { title: 'Live Weather', desc: 'Surface telemetry, AQI meter & heat index.', path: '/worker/weather', icon: <WbSunnyIcon sx={{ color: '#ffb300' }} /> },
      ]
    },
    {
      name: 'COMMUNICATION',
      color: '#ef4444',
      modules: [
        { title: 'Emergency SOS', desc: 'Instant distress beacon & Control Room dispatch.', path: '/worker/sos', icon: <EmergencyIcon sx={{ color: '#ef4444' }} /> },
        { title: 'Real-Time Chat', desc: 'Multi-channel chat with Supervisor & Admin.', path: '/worker/chat', icon: <ChatIcon sx={{ color: '#0288d1' }} /> },
        { title: 'Notifications', desc: 'Real-time safety alerts & system broadcasts.', path: '/worker/notifications', icon: <NotificationsActiveIcon sx={{ color: '#ec4899' }} /> },
      ]
    },
    {
      name: 'PERFORMANCE',
      color: '#a855f7',
      modules: [
        { title: 'Streaks & Badges', desc: 'Gamification XP, streaks & unlocked badges.', path: '/worker/streaks', icon: <EmojiEventsIcon sx={{ color: '#a855f7' }} /> },
      ]
    }
  ];

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <Typography variant="h5" fontWeight="900" sx={{ color: '#0f172a' }}>
          WORKER SAFETY MODULES
        </Typography>
        <Chip label="Categorized Command Catalog" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
      </Box>

      {categories.map((cat) => (
        <Box key={cat.name} sx={{ mb: 3.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 900,
              letterSpacing: '0.12em',
              color: cat.color,
              display: 'block',
              mb: 1.5
            }}
          >
            ● {cat.name}
          </Typography>

          <Grid container spacing={2}>
            {cat.modules.map((mod) => (
              <Grid item xs={12} sm={6} md={4} key={mod.path}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    height: '100%',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
                      borderColor: cat.color
                    }
                  }}
                >
                  <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                      <Box sx={{ display: 'flex' }}>{mod.icon}</Box>
                      <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#0f172a' }}>
                        {mod.title}
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1, mb: 2, display: 'block', lineHeight: 1.4 }}>
                      {mod.desc}
                    </Typography>

                    <Box textAlign="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(mod.path)}
                        endIcon={<ArrowForwardIcon sx={{ fontSize: '0.9rem !important' }} />}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          py: 0.4,
                          borderColor: '#cbd5e1',
                          color: '#334155',
                          '&:hover': { borderColor: cat.color, bgcolor: `${cat.color}10` }
                        }}
                      >
                        Open
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

export default CategorizedModuleCatalog;
