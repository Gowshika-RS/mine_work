import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress, Grid } from '@mui/material';
import axios from 'axios';

export const ShiftSetup = ({ workerId }) => {
  const [shiftData, setShiftData] = useState({
    shift_start_time: '08:00',
    shift_end_time: '16:00',
    total_hours: 8.0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch current shift schedule
  useEffect(() => {
    const fetchShiftSchedule = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/shifts/schedule/current', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShiftData(response.data);
      } catch (err) {
        console.error('Failed to fetch shift schedule:', err);
        setShiftData({
          shift_start_time: '08:00',
          shift_end_time: '16:00',
          total_hours: 8.0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchShiftSchedule();
  }, []);

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setShiftData((prev) => {
      const updated = { ...prev, [name]: value };
      // Calculate total hours if both times are set
      if (updated.shift_start_time && updated.shift_end_time) {
        const [startH, startM] = updated.shift_start_time.split(':').map(Number);
        const [endH, endM] = updated.shift_end_time.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        let diff = endMinutes - startMinutes;
        if (diff < 0) diff += 24 * 60; // Handle overnight shifts
        updated.total_hours = (diff / 60).toFixed(2);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/api/shifts/schedule/update',
        null,
        {
          params: {
            shift_start_time: shiftData.shift_start_time,
            shift_end_time: shiftData.shift_end_time,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess('Shift schedule updated successfully!');
        setShiftData({
          shift_start_time: response.data.shift_start_time,
          shift_end_time: response.data.shift_end_time,
          total_hours: response.data.total_hours,
        });
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update shift schedule');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Shift Hours Setup
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Shift Start Time"
                type="time"
                name="shift_start_time"
                value={shiftData.shift_start_time}
                onChange={handleTimeChange}
                InputLabelProps={{ shrink: true }}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Shift End Time"
                type="time"
                name="shift_end_time"
                value={shiftData.shift_end_time}
                onChange={handleTimeChange}
                InputLabelProps={{ shrink: true }}
                disabled={saving}
              />
            </Grid>
          </Grid>

          <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
            <Typography variant="body1">
              <strong>Total Shift Hours:</strong> {shiftData.total_hours} hours
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={saving}
            sx={{ mr: 1 }}
          >
            {saving ? 'Updating...' : 'Update Shift Schedule'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
