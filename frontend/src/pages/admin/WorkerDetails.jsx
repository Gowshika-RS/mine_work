import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Avatar, Button, Divider, Chip, CircularProgress, Alert } from '@mui/material';
import { Email, Phone, LocationOn, VerifiedUser, Work } from '@mui/icons-material';
import apiClient from '../../api/client';

export const WorkerDetails = () => {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWorker = async () => {
      try {
        const response = await apiClient.get('/admin/workers');
        const firstWorker = response.data?.[0];
        if (firstWorker) {
          setWorker(firstWorker);
        } else {
          setError('No worker records found');
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load worker details');
      } finally {
        setLoading(false);
      }
    };

    loadWorker();
  }, []);

  if (loading) {
    return (
      <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !worker) {
    return <Alert severity="error" sx={{ mt: 3 }}>{error || 'Unable to load worker details'}</Alert>;
  }

  const profile = worker.profile || {};
  const initials = (profile.full_name || worker.username || 'W').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Worker Details
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, fontSize: '3rem' }}>
                {initials}
              </Avatar>
              <Typography variant="h6">{profile.full_name || worker.username}</Typography>
              <Chip label={worker.is_active ? 'active' : 'inactive'} color={worker.is_active ? 'success' : 'default'} sx={{ my: 1 }} />
              <Typography variant="h4" sx={{ color: 'success.main', my: 1 }}>
                {Number(profile.safety_score || 0).toFixed(1)}%
              </Typography>
              <Typography color="textSecondary" variant="body2">
                Safety Score
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button variant="contained" size="small" fullWidth>
                  Edit
                </Button>
                <Button variant="outlined" size="small" fullWidth color="error">
                  Deactivate
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Contact Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email />
                  <Typography>{worker.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone />
                  <Typography>{profile.phone_number || 'Not provided'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn />
                  <Typography>{profile.mine_location || 'Not provided'}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>
                Employment Details
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">
                    Employee ID
                  </Typography>
                  <Typography>{profile.employee_id || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">
                    Department
                  </Typography>
                  <Typography>{profile.department || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">
                    Join Date
                  </Typography>
                  <Typography>{profile.joining_date || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">
                    Designation
                  </Typography>
                  <Typography>{profile.designation || 'N/A'}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>
                Profile Highlights
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip icon={<VerifiedUser />} label={profile.blood_group || 'N/A'} color="primary" variant="outlined" />
                <Chip icon={<Work />} label={profile.department || 'N/A'} color="secondary" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
