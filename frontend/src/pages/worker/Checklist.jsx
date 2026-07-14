import { Box, Card, CardContent, Typography, Checkbox, FormControlLabel, Button, LinearProgress, Alert, CircularProgress } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import apiClient from '../../api/client';

export const Checklist = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [checklist, setChecklist] = useState({
    helmet_worn: false,
    safety_boots_worn: false,
    gas_detector_checked: false,
    emergency_light_working: false,
    communication_device_working: false,
  });

  const fetchActiveChecklist = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/safety/checklist/active');
      if (response.data) {
        setChecklist({
          helmet_worn: response.data.helmet_worn || false,
          safety_boots_worn: response.data.safety_boots_worn || false,
          gas_detector_checked: response.data.gas_detector_checked || false,
          emergency_light_working: response.data.emergency_light_working || false,
          communication_device_working: response.data.communication_device_working || false,
        });
      }
    } catch (err) {
      console.error('Failed to load active checklist:', err);
      // Suppress error if no active shift since that's a common user state
      if (err.response?.status !== 404) {
        setError('Failed to fetch safety checklist.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveChecklist();
  }, []);

  const handleToggle = (key) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const checklistItems = [
    { key: 'helmet_worn', label: 'Helmet & Headlamp Verified' },
    { key: 'safety_boots_worn', label: 'Steel-toed Safety Shoes' },
    { key: 'gas_detector_checked', label: 'Portable Gas Detector Calibrated' },
    { key: 'emergency_light_working', label: 'Reflective Safety Jacket & Light' },
    { key: 'communication_device_working', label: 'Two-Way Radio/Communication Device' },
  ];

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const completionPercentage = (completedCount / checklistItems.length) * 100;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await apiClient.post('/safety/checklist', checklist);
      setSuccess('Precaution checklist submitted successfully!');
      fetchActiveChecklist();
    } catch (err) {
      console.error('Failed to submit checklist:', err);
      setError(err.response?.data?.detail || 'Failed to submit checklist. Please ensure you have started your shift.');
    } finally {
      setSubmitting(false);
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
        Daily PPE Checklist
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ maxWidth: 600 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">PPE Compliance</Typography>
              <Typography variant="subtitle2" fontWeight="bold">{completedCount}/{checklistItems.length} ({Math.round(completionPercentage)}%)</Typography>
            </Box>
            <LinearProgress variant="determinate" value={completionPercentage} sx={{ height: 8, borderRadius: 4 }} />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {checklistItems.map((item) => (
              <Box 
                key={item.key}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: checklist[item.key] ? 'action.selected' : 'transparent',
                  border: '1px solid',
                  borderColor: checklist[item.key] ? 'primary.light' : 'divider',
                  transition: 'all 0.2s'
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checklist[item.key]}
                      onChange={() => handleToggle(item.key)}
                      color="primary"
                    />
                  }
                  label={item.label}
                  sx={{ width: '100%', m: 0 }}
                />
              </Box>
            ))}
          </Box>

          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 4 }}
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting...' : 'Submit Pre-Shift Checklist'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
