import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { Email, Phone, LocationOn, VerifiedUser, Work, ArrowBack, History, WarningAmber } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

export const WorkerDetails = () => {
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const workerIdParam = queryParams.get('id');

  useEffect(() => {
    const loadWorkerDetails = async () => {
      setLoading(true);
      setError('');
      try {
        let workerId = workerIdParam;
        if (!workerId) {
          // Fallback to first available worker
          const res = await apiClient.get('/admin/workers');
          if (res.data && res.data.length > 0) {
            workerId = res.data[0].id;
          } else {
            setError('No worker accounts registered in system');
            setLoading(false);
            return;
          }
        }
        const response = await apiClient.get(`/admin/workers/${workerId}`);
        setWorkerData(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to fetch worker details');
      } finally {
        setLoading(false);
      }
    };

    loadWorkerDetails();
  }, [workerIdParam]);

  if (loading) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={44} />
      </Box>
    );
  }

  if (error || !workerData) {
    return (
      <Box sx={{ py: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/workers')} sx={{ mb: 2 }}>
          Back to Workers List
        </Button>
        <Alert severity="error">{error || 'Worker record unavailable'}</Alert>
      </Box>
    );
  }

  const { user, profile, shifts, hazards, sos_alerts, safety_history } = workerData;
  const initials = (profile?.full_name || user?.username || 'W')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Box sx={{ py: 3 }}>
      {/* Navigation Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} variant="outlined" onClick={() => navigate('/admin/workers')}>
          Back to Workers
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Worker Profile & History
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Avatar & Summary Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 1 }}>
            <CardContent>
              <Avatar sx={{ width: 110, height: 110, mx: 'auto', mb: 2, fontSize: '2.5rem', bgcolor: 'primary.main' }}>
                {initials}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {profile.full_name || user.username}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                @{user.username} | {profile.designation || 'Worker'}
              </Typography>
              <Chip
                label={user.is_active ? 'Active Account' : 'Inactive Account'}
                color={user.is_active ? 'success' : 'default'}
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <Box sx={{ my: 1 }}>
                <Typography variant="h3" sx={{ color: 'success.main', fontWeight: 800 }}>
                  {Number(profile.safety_score || 100).toFixed(1)}%
                </Typography>
                <Typography color="textSecondary" variant="body2" sx={{ fontWeight: 600 }}>
                  Current Safety Score
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Profile Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Personal & Contact Details
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">Email Address</Typography>
                      <Typography variant="body2">{user.email}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">Phone Number</Typography>
                      <Typography variant="body2">{profile.phone_number || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">Mine Sector / Location</Typography>
                      <Typography variant="body2">{profile.mine_location || 'Zone 1'}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Work color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">Department</Typography>
                      <Typography variant="body2">{profile.department || 'Operations'}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Emergency Contact Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Contact Name</Typography>
                  <Typography variant="body2">{profile.emergency_contact_name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Contact Number</Typography>
                  <Typography variant="body2">{profile.emergency_contact_number || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Blood Group</Typography>
                  <Typography variant="body2">{profile.blood_group || 'O+'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Medical Conditions</Typography>
                  <Typography variant="body2">{profile.medical_conditions || 'None'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Shift & Attendance History */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <History color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Recent Shift History
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Start Time</TableCell>
                      <TableCell>Total Hours</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shifts.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{new Date(s.start_time).toLocaleString()}</TableCell>
                        <TableCell>{s.total_hours ? `${s.total_hours} hrs` : 'Active'}</TableCell>
                        <TableCell>
                          <Chip label={s.attendance_status} size="small" color="primary" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    ))}
                    {shifts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No recorded shifts</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Reported Hazards History */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <WarningAmber color="warning" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Reported Hazard Activity
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Hazard Type</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hazards.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell>{h.hazard_type}</TableCell>
                        <TableCell>
                          <Chip label={h.severity} size="small" color={h.severity === 'critical' ? 'error' : 'warning'} />
                        </TableCell>
                        <TableCell>{h.status}</TableCell>
                      </TableRow>
                    ))}
                    {hazards.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No reported hazards</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
