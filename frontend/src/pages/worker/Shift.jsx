import { Box, Card, CardContent, Typography, Button, Chip, Grid, TextField, Alert, CircularProgress } from '@mui/material';
import { CheckCircle, PlayArrow, Stop, Schedule } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import apiClient from '../../api/client';

export const Shift = () => {
  const [activeShift, setActiveShift] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Schedule states
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  const fetchShiftData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch active shift
      const activeRes = await apiClient.get('/shifts/active');
      setActiveShift(activeRes.data);

      // 2. Fetch history
      const historyRes = await apiClient.get('/shifts/history');
      setHistory(historyRes.data);

      // 3. Fetch schedule
      const schedRes = await apiClient.get('/shifts/schedule/current');
      if (schedRes.data) {
        setStartTime(schedRes.data.shift_start_time || '08:00');
        setEndTime(schedRes.data.shift_end_time || '16:00');
      }
    } catch (err) {
      console.error('Failed to load shift details:', err);
      setError('Could not fetch shift data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftData();
  }, []);

  const handleStartShift = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await apiClient.post('/shifts/start');
      setActiveShift(response.data);
      setSuccess('Shift started successfully!');
      fetchShiftData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start shift.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndShift = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiClient.post('/shifts/end');
      setActiveShift(null);
      setSuccess('Shift ended successfully!');
      fetchShiftData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to end shift.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSchedule = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiClient.post(`/shifts/schedule/update?shift_start_time=${startTime}&shift_end_time=${endTime}`);
      setSuccess('Shift schedule hours updated successfully!');
      setIsEditingSchedule(false);
      fetchShiftData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update schedule.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Shift Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Current Shift Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Current Shift Status
              </Typography>

              {activeShift ? (
                <Box>
                  <Chip label="Active Now" color="success" sx={{ mb: 2, fontWeight: 'bold' }} />
                  <Typography variant="body2" color="textSecondary">Started At</Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {new Date(activeShift.start_time).toLocaleString()}
                  </Typography>

                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Stop />}
                    disabled={actionLoading}
                    onClick={handleEndShift}
                    sx={{ borderRadius: 6 }}
                  >
                    Check Out / End Shift
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Chip label="Off Duty" color="default" sx={{ mb: 2 }} />
                  <Typography variant="body1" paragraph>
                    You are not checked in currently. Start your shift to begin recording location and safety compliance.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrow />}
                    disabled={actionLoading}
                    onClick={handleStartShift}
                    sx={{ borderRadius: 6 }}
                  >
                    Check In / Start Shift
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Schedule Configuration Card */}
          <Card sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Edit Schedule Hours
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Start Time"
                    type="time"
                    fullWidth
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={!isEditingSchedule}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="End Time"
                    type="time"
                    fullWidth
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={!isEditingSchedule}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              {isEditingSchedule ? (
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button variant="contained" size="small" onClick={handleUpdateSchedule} disabled={actionLoading}>
                    Save Hours
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => setIsEditingSchedule(false)}>
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<Schedule />} 
                  sx={{ mt: 2, borderRadius: 6 }} 
                  onClick={() => setIsEditingSchedule(true)}
                >
                  Configure Hours
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Shift History */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Shift History
              </Typography>
              {history.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No shift history found.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {history.map((item) => (
                    <Card variant="outlined" key={item.id} sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {new Date(item.start_time).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" display="block">
                            {new Date(item.start_time).toLocaleTimeString()} - {item.end_time ? new Date(item.end_time).toLocaleTimeString() : 'In Progress'}
                          </Typography>
                        </Box>
                        <Chip
                          label={item.attendance_status.toUpperCase()}
                          size="small"
                          color={item.attendance_status === 'completed' ? 'primary' : 'success'}
                        />
                      </Box>
                      {item.total_hours && (
                        <Typography variant="body2" fontWeight="bold" color="primary" sx={{ mt: 1 }}>
                          Hours worked: {parseFloat(item.total_hours).toFixed(2)} hrs
                        </Typography>
                      )}
                    </Card>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
