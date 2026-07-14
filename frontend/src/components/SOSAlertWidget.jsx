import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Grid,
} from '@mui/material';
import { Phone as PhoneIcon, Map as MapIcon } from '@mui/icons-material';
import apiClient from '../api/client';
import { SOSButton } from './SOSButton';

export const SOSAlertWidget = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [myActiveAlert, setMyActiveAlert] = useState(null);

  useEffect(() => {
    checkMyActiveAlert();
    const interval = setInterval(checkMyActiveAlert, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const checkMyActiveAlert = async () => {
    try {
      const response = await apiClient.get('/sos/active');

      // Find alerts triggered by current user
      if (response.data && response.data.length > 0) {
        const myAlerts = response.data.filter((alert) => alert.status === 'active');
        if (myAlerts.length > 0) {
          setMyActiveAlert(myAlerts[0]);
          setAlertTriggered(true);
        }
      }
      setError('');
    } catch (err) {
      console.error('Failed to check SOS alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSOSSuccess = () => {
    setAlertTriggered(true);
    checkMyActiveAlert();
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3, borderLeft: '4px solid #f44336' }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Emergency SOS Alert
              </Typography>

              {alertTriggered && myActiveAlert ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <strong>⚠️ Active SOS Alert!</strong>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Your emergency alert has been sent to administrators. Help is on the way.
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    Alert ID: {myActiveAlert.id} | Time: {new Date(myActiveAlert.timestamp).toLocaleTimeString()}
                  </Typography>
                </Alert>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Press the SOS button below if you are in emergency and need immediate assistance. Your location will be shared with administrators.
                </Typography>
              )}

              {error && <Alert severity="warning" sx={{ mt: 1 }}>{error}</Alert>}
            </Box>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <SOSButton onSuccess={handleSOSSuccess} />

            {alertTriggered && myActiveAlert && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<MapIcon />}
                size="small"
              >
                View My Location
              </Button>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
