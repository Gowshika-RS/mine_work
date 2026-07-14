import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Phone as PhoneIcon, Cancel as CancelIcon } from '@mui/icons-material';
import axios from 'axios';

export const SOSButton = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [location, setLocation] = useState(null);

  // Get current location when dialog opens
  useEffect(() => {
    if (open && !location) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (err) => {
            setError(`Location error: ${err.message}`);
            // Set default location if geolocation fails
            setLocation({
              latitude: 20.5937,
              longitude: 78.9629,
            });
          }
        );
      } else {
        setError('Geolocation is not supported');
        setLocation({
          latitude: 20.5937,
          longitude: 78.9629,
        });
      }
    }
  }, [open, location]);

  const handleOpen = () => {
    setOpen(true);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
    setSuccess('');
  };

  const handleTriggerSOS = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      if (!location) {
        setError('Location data not available');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        'http://localhost:8000/api/sos/trigger',
        {
          latitude: location.latitude,
          longitude: location.longitude,
          alert_type: 'emergency',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        setSuccess('SOS signal sent successfully! Administrators and emergency services have been notified.');

        // Close dialog after 2 seconds
        setTimeout(() => {
          handleClose();
        }, 2000);

        if (onSuccess) {
          onSuccess(response.data);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || 'Failed to send SOS signal'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* SOS Button */}
      <Button
        variant="contained"
        color="error"
        size="large"
        startIcon={<PhoneIcon />}
        onClick={handleOpen}
        sx={{
          py: 1.5,
          px: 3,
          fontSize: '1rem',
          fontWeight: 'bold',
          borderRadius: 2,
          boxShadow: 3,
          '&:hover': {
            boxShadow: 6,
            animation: 'pulse 1s infinite',
          },
          '@keyframes pulse': {
            '0%': {
              boxShadow: '0px 0px 0px 0px rgba(244, 67, 54, 0.7)',
            },
            '70%': {
              boxShadow: '0px 0px 0px 10px rgba(244, 67, 54, 0)',
            },
            '100%': {
              boxShadow: '0px 0px 0px 0px rgba(244, 67, 54, 0)',
            },
          },
        }}
      >
        🆘 SOS Emergency Alert
      </Button>

      {/* SOS Confirmation Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#f44336', color: 'white', fontWeight: 'bold' }}>
          🆘 EMERGENCY SOS ALERT
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            You are about to trigger an emergency SOS alert. This will:
          </Typography>

          <Box component="ul" sx={{ mb: 2, pl: 2 }}>
            <li>
              <Typography variant="body2">
                Notify all administrators and emergency personnel immediately
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Share your real-time location ({location?.latitude?.toFixed(4)}, {location?.longitude?.toFixed(4)})
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Trigger emergency protocols
              </Typography>
            </li>
          </Box>

          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Only trigger this if you are in genuine danger or need immediate assistance!</strong>
          </Alert>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            startIcon={<CancelIcon />}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleTriggerSOS}
            disabled={loading}
            color="error"
            variant="contained"
            startIcon={<PhoneIcon />}
            sx={{ fontWeight: 'bold' }}
          >
            {loading ? 'Sending...' : 'TRIGGER SOS'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
