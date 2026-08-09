import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  SupervisorAccount as SupervisorIcon,
  People as WorkersIcon,
  Map as ZoneIcon,
  Add as AddIcon,
  CheckCircle as VerifiedIcon
} from '@mui/icons-material';
import apiClient from '../../api/client';

export default function Supervisors() {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/supervisors');
      setSupervisors(res.data || []);
    } catch (err) {
      console.error('Failed to load supervisors:', err);
      setError('Could not fetch supervisor roster.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 2, maxWidth: 1100, mx: 'auto' }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          border: '1px solid #334155'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <SupervisorIcon sx={{ fontSize: 36, color: '#38bdf8' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Supervisor Roster & Zone Assignment
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Manage mine shift supervisors, assigned workers, sector zones, and safety performance
              </Typography>
            </Box>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#1e293b' }}>
                <TableRow>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Supervisor</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Department</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Assigned Zone</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Assigned Workers</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Performance</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {supervisors.length > 0 ? (
                  supervisors.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ bgcolor: '#0284c7', fontWeight: 'bold' }}>
                            {s.full_name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold" color="#fff">
                              {s.full_name}
                            </Typography>
                            <Typography variant="caption" color="#94a3b8">
                              {s.username} • {s.phone_number}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ color: '#fff' }}>{s.department}</TableCell>

                      <TableCell>
                        <Chip icon={<ZoneIcon />} label={s.assigned_zone} color="primary" size="small" variant="outlined" />
                      </TableCell>

                      <TableCell>
                        <Chip icon={<WorkersIcon />} label={`${s.assigned_workers_count} Workers`} color="info" size="small" />
                      </TableCell>

                      <TableCell sx={{ color: '#4ade80', fontWeight: 'bold' }}>
                        {s.performance_rating}% Rating
                      </TableCell>

                      <TableCell>
                        <Chip label={s.is_active ? 'Active' : 'Inactive'} color={s.is_active ? 'success' : 'default'} size="small" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: '#94a3b8', py: 3 }}>
                      No supervisors assigned.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
