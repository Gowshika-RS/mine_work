import { useState, useEffect, useRef } from 'react';
import { Fab, CircularProgress, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Sos } from '@mui/icons-material';

export const SOSButton = ({ userRole }) => {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSosActive, setIsSosActive] = useState(false);
  const pressTimer = useRef(null);
  const intervalTimer = useRef(null);

  const LONG_PRESS_DURATION = 3000; // 3 seconds
  const INTERVAL_STEP = 100; // 100ms update

  if (userRole !== 'worker') return null;

  const startPress = (e) => {
    // Prevent default context menu on long press for touch devices
    if (e.type === 'touchstart') e.preventDefault();
    
    setIsPressing(true);
    setProgress(0);
    
    intervalTimer.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (INTERVAL_STEP / LONG_PRESS_DURATION) * 100;
        return next >= 100 ? 100 : next;
      });
    }, INTERVAL_STEP);

    pressTimer.current = setTimeout(() => {
      activateSos();
    }, LONG_PRESS_DURATION);
  };

  const endPress = () => {
    setIsPressing(false);
    setProgress(0);
    if (pressTimer.current) clearTimeout(pressTimer.current);
    if (intervalTimer.current) clearInterval(intervalTimer.current);
  };

  const activateSos = () => {
    endPress();
    setIsSosActive(true);
    // In a real app, we would send API requests here with geolocation, sensor data, etc.
    if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
  };

  const handleClose = () => {
    setIsSosActive(false);
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 80, md: 32 }, // Above bottom nav on mobile, standard on desktop
          right: { xs: 16, md: 32 },
          zIndex: 1100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ position: 'relative' }}>
          {isPressing && (
            <CircularProgress
              variant="determinate"
              value={progress}
              size={68}
              thickness={4}
              sx={{
                color: 'error.main',
                position: 'absolute',
                top: -6,
                left: -6,
                zIndex: 1,
              }}
            />
          )}
          <Fab
            color="error"
            aria-label="sos"
            onMouseDown={startPress}
            onMouseUp={endPress}
            onMouseLeave={endPress}
            onTouchStart={startPress}
            onTouchEnd={endPress}
            sx={{
              width: 56,
              height: 56,
              boxShadow: '0 8px 16px rgba(239, 68, 68, 0.4)',
              transition: 'transform 0.2s',
              transform: isPressing ? 'scale(0.95)' : 'scale(1)',
              '&:hover': {
                backgroundColor: 'error.dark',
              },
            }}
          >
            <Sos sx={{ fontSize: 32 }} />
          </Fab>
        </Box>
        <Typography 
          variant="caption" 
          sx={{ 
            mt: 1, 
            fontWeight: 'bold', 
            color: 'error.main',
            textShadow: '0 1px 2px rgba(255,255,255,0.8)'
          }}
        >
          HOLD 3S
        </Typography>
      </Box>

      {/* SOS Activated Dialog */}
      <Dialog open={isSosActive} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5rem' }}>
          EMERGENCY SOS ACTIVATED
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body1" paragraph>
            Your location, sensor data, and employee ID have been transmitted to the control room.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Emergency contacts and supervisors have been notified. Please move to the nearest safe zone if possible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={handleClose} variant="contained" color="error" size="large">
            Acknowledge & Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
