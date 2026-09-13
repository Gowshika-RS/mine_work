import React from 'react';
import { Paper, Box, Typography, Grid, Chip, Button, LinearProgress } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SpeedIcon from '@mui/icons-material/Speed';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const HealthFatigueCard = ({ healthAssessment }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Extract vitals or fallback defaults
  const fatigueLevel = healthAssessment?.fatigue_level ?? 2; // 1-10 scale
  const heartRate = healthAssessment?.heart_rate || 74; // bpm
  const bpSys = healthAssessment?.blood_pressure_sys || 118; // mmHg
  const bpDia = healthAssessment?.blood_pressure_dia || 78; // mmHg
  const hydration = healthAssessment?.hydration_status || 'adequate';

  // Determine status color & label
  let statusLabel = 'NORMAL';
  let statusColor = '#059669'; // Green
  let statusBg = '#ecfdf5';
  let statusBorder = '#a7f3d0';

  if (fatigueLevel >= 7 || healthAssessment?.severity === 'critical') {
    statusLabel = 'FLAGGED';
    statusColor = '#dc2626'; // Red
    statusBg = '#fef2f2';
    statusBorder = '#fca5a5';
  } else if (fatigueLevel >= 4 || healthAssessment?.severity === 'warning' || healthAssessment?.severity === 'caution') {
    statusLabel = 'ELEVATED';
    statusColor = '#d97706'; // Orange
    statusBg = '#fffbeb';
    statusBorder = '#fde68a';
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <HealthAndSafetyIcon sx={{ color: '#0284c7', fontSize: 22 }} />
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: '#64748b' }}>
            {t('dashboard.healthFatigue', 'HEALTH & FATIGUE MONITORING')}
          </Typography>
        </Box>
        <Chip
          label={statusLabel}
          size="small"
          sx={{
            bgcolor: statusBg,
            color: statusColor,
            fontWeight: 800,
            fontSize: '0.7rem',
            border: `1px solid ${statusBorder}`
          }}
        />
      </Box>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {/* Pre-shift Heart Rate */}
        <Grid item xs={6} sm={4}>
          <Box p={1.5} borderRadius={2} bgcolor="#f8fafc" border="1px solid #e2e8f0">
            <Box display="flex" alignItems="center" gap={0.8} mb={0.5}>
              <FavoriteIcon sx={{ color: '#ef4444', fontSize: 16 }} />
              <Typography variant="caption" color="text.secondary" fontWeight="700">
                Heart Rate
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight="800" color="#0f172a">
              {heartRate} <Typography component="span" variant="caption" fontWeight="600">bpm</Typography>
            </Typography>
          </Box>
        </Grid>

        {/* Blood Pressure */}
        <Grid item xs={6} sm={4}>
          <Box p={1.5} borderRadius={2} bgcolor="#f8fafc" border="1px solid #e2e8f0">
            <Box display="flex" alignItems="center" gap={0.8} mb={0.5}>
              <SpeedIcon sx={{ color: '#3b82f6', fontSize: 16 }} />
              <Typography variant="caption" color="text.secondary" fontWeight="700">
                Blood Pressure
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight="800" color="#0f172a">
              {bpSys}/{bpDia} <Typography component="span" variant="caption" fontWeight="600">mmHg</Typography>
            </Typography>
          </Box>
        </Grid>

        {/* Hydration */}
        <Grid item xs={12} sm={4}>
          <Box p={1.5} borderRadius={2} bgcolor="#f8fafc" border="1px solid #e2e8f0">
            <Box display="flex" alignItems="center" gap={0.8} mb={0.5}>
              <WaterDropIcon sx={{ color: '#0284c7', fontSize: 16 }} />
              <Typography variant="caption" color="text.secondary" fontWeight="700">
                Hydration
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight="800" color="#0f172a" sx={{ textTransform: 'capitalize' }}>
              {hydration}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Fatigue Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography variant="caption" fontWeight="700" color="text.secondary">
            Pre-Shift Fatigue Level: {fatigueLevel} / 10
          </Typography>
          <Typography variant="caption" fontWeight="700" sx={{ color: statusColor }}>
            {fatigueLevel <= 3 ? 'Low Risk' : fatigueLevel <= 6 ? 'Moderate Risk' : 'High Risk'}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(fatigueLevel / 10) * 100}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: '#f1f5f9',
            '& .MuiLinearProgress-bar': {
              bgcolor: statusColor,
              borderRadius: 4
            }
          }}
        />
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Button
        variant="outlined"
        fullWidth
        size="small"
        endIcon={<ArrowForwardIcon />}
        onClick={() => navigate('/worker/checklist')}
        sx={{ borderRadius: 2, fontWeight: 700, color: '#0284c7', borderColor: '#bae6fd' }}
      >
        Self-Check / Update Health
      </Button>
    </Paper>
  );
};

export default HealthFatigueCard;
