import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, Button, CircularProgress, Chip, Stack, Grid } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SensorsIcon from '@mui/icons-material/Sensors';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import { useTranslation } from 'react-i18next';

export const HoldToSOSButton = ({ onTriggerSOS, loading, activeSOS }) => {
  const { t } = useTranslation();
  const [holdingProgress, setHoldingProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const HOLD_DURATION_MS = 3000; // Require 3-second hold

  const startHold = () => {
    if (loading || activeSOS) return;
    setIsHolding(true);
    startTimeRef.current = Date.now();
    setHoldingProgress(0);

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / HOLD_DURATION_MS) * 100, 100);
      setHoldingProgress(progress);

      if (elapsed >= HOLD_DURATION_MS) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
        setIsHolding(false);
        setHoldingProgress(0);
        onTriggerSOS();
      }
    }, 50);
  };

  const stopHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldingProgress(0);
  };

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: '#ffffff',
        border: '1px solid #fee2e2',
        boxShadow: '0 2px 10px rgba(220, 38, 38, 0.05)',
        transition: 'all 0.2s ease',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: '#dc2626', fontSize: '0.7rem' }}>
            {t('dashboard.emergencyAssistance') || 'EMERGENCY ASSISTANCE'}
          </Typography>
          <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#0f172a', lineHeight: 1.2 }}>
            {t('dashboard.useSosOnly') || 'Use SOS only when immediate assistance is required.'}
          </Typography>
        </Box>

        <Chip
          icon={<SensorsIcon sx={{ color: '#059669 !important', fontSize: '0.9rem' }} />}
          label={t('dashboard.supervisorConnected') || 'Supervisor Connected'}
          size="small"
          sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: '0.75rem', border: '1px solid #a7f3d0' }}
        />
      </Box>

      {/* Interactive Hold Button */}
      <Box textAlign="center" my={1.5}>
        <Button
          variant="contained"
          color="error"
          onMouseDown={startHold}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={startHold}
          onTouchEnd={stopHold}
          disabled={loading || !!activeSOS}
          sx={{
            width: '100%',
            py: 1.8,
            borderRadius: 2.5,
            fontSize: '0.95rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'none',
            bgcolor: activeSOS ? '#991b1b' : '#dc2626',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            '&:hover': { bgcolor: '#b91c1c' },
            '&.Mui-disabled': { bgcolor: activeSOS ? '#991b1b' : '#fca5a5', color: '#ffffff' }
          }}
        >
          {/* Progress Overlay during Hold */}
          {isHolding && (
            <Box
              sx={{
                position: 'absolute',
                left: 0, top: 0, bottom: 0,
                width: `${holdingProgress}%`,
                bgcolor: 'rgba(255, 255, 255, 0.35)',
                transition: 'width 0.05s linear'
              }}
            />
          )}

          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ position: 'relative', zIndex: 1 }}>
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <WarningIcon sx={{ fontSize: '1.25rem' }} />
            )}
            <Typography variant="button" fontWeight="800" sx={{ fontSize: '0.9rem', letterSpacing: '0.03em' }}>
              {loading
                ? (t('dashboard.transmitting') || 'TRANSMITTING EMERGENCY BEACON...')
                : isHolding
                ? (t('dashboard.holdingProgress', { progress: Math.round(holdingProgress) }) || `HOLDING... ${Math.round(holdingProgress)}%`)
                : activeSOS
                ? (t('dashboard.activeEmergencyDispatched') || 'EMERGENCY BEACON ACTIVE')
                : (t('dashboard.hold3Sec') || 'HOLD FOR 3 SECONDS TO TRIGGER SOS')}
            </Typography>
          </Stack>
        </Button>
      </Box>

      {/* Location & Contact Meta Info */}
      <Grid container spacing={1.5} sx={{ mt: 0.5, pt: 1, borderTop: '1px solid #f1f5f9' }}>
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center" gap={1} sx={{ color: '#475569' }}>
            <MyLocationIcon fontSize="small" sx={{ color: '#2563eb', fontSize: '1rem' }} />
            <Typography variant="caption" fontWeight="600" sx={{ fontSize: '0.78rem' }}>
              GPS Location: <strong>Sector B · Ramp 4 (12.9716, 77.5946)</strong>
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} textAlign={{ sm: 'right' }}>
          <Box display="flex" alignItems="center" gap={1} justifyContent={{ sm: 'flex-end' }} sx={{ color: '#475569' }}>
            <PhoneInTalkIcon fontSize="small" sx={{ color: '#059669', fontSize: '1rem' }} />
            <Typography variant="caption" fontWeight="600" sx={{ fontSize: '0.78rem' }}>
              Control Room: <strong>Ext. 911 (+91 1800-MINE-SAFE)</strong>
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default HoldToSOSButton;

