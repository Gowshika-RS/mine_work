import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import axios from 'axios';

export const HazardReporter = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    hazard_type: '',
    severity: 'medium',
    description: '',
    location: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hazardTypes = [
    'Gas Leak',
    'Structural Damage',
    'Equipment Malfunction',
    'Electrical Hazard',
    'Fire Risk',
    'Chemical Spill',
    'Ventilation Issue',
    'Noise Hazard',
    'Water Ingress',
    'Unstable Ground',
    'Other',
  ];

  const severityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.hazard_type.trim()) {
      setError('Please select a hazard type');
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide a description');
      setLoading(false);
      return;
    }
    if (!formData.location.trim()) {
      setError('Please specify the location');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/api/hazards/report',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        setSuccess('Hazard reported successfully! Administrators have been notified.');
        setFormData({
          hazard_type: '',
          severity: 'medium',
          description: '',
          location: '',
        });

        if (onSuccess) {
          onSuccess(response.data);
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || 'Failed to report hazard'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Report a Hazard
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Hazard Type *</InputLabel>
                <Select
                  name="hazard_type"
                  value={formData.hazard_type}
                  onChange={handleChange}
                  label="Hazard Type"
                >
                  {hazardTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Severity Level *</InputLabel>
                <Select
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  label="Severity Level"
                >
                  {severityLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location *"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Shaft 2, Level 3, Tunnel B"
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description *"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the hazard, its characteristics, and potential risks..."
                multiline
                rows={5}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="error"
                type="submit"
                disabled={loading}
                fullWidth
                sx={{ py: 1.5 }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Reporting...
                  </>
                ) : (
                  'Report Hazard'
                )}
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                <strong>Important:</strong> Report all hazards immediately. Your safety and the safety of
                others depends on timely reporting. Administrators will be notified and respond promptly.
              </Alert>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};
