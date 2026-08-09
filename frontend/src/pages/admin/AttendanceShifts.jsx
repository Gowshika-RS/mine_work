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
  Alert,
  CircularProgress
} from '@mui/material';
import {
  EventAvailable as AttendanceIcon,
  Schedule as TimeIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import apiClient from '../../api/client';

export default function AttendanceShifts() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendanceSummary();
  }, []);

  const fetchAttendanceSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/shifts/attendance-summary');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load attendance:', err);
      setError('Could not fetch attendance and shift telemetry.');
    } finally {
      setLoading(false);
    }
  };

  const { total_workers = 0, checked_in = 0, checked_out = 0, still_in_mine = 0, absent = 0, attendance_rate = 95.0, workers = [] } = data || {};

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
            <AttendanceIcon sx={{ fontSize: 36, color: '#0284c7' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Real-Time Attendance & Shift Monitoring
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Live monitoring of workers currently inside the mine, shift durations, and overtime threshold alerts
              </Typography>
            </Box>
          </Box>

          <Chip label={`${attendance_rate}% Attendance Rate`} color="success" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }} />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={2.4}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="#94a3b8">TOTAL FLEET</Typography>
              <Typography variant="h4" fontWeight="bold" color="#fff" my={0.5}>{total_workers}</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #22c55e', borderRadius: 3, p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="#4ade80">CHECKED IN</Typography>
              <Typography variant="h4" fontWeight="bold" color="#22c55e" my={0.5}>{checked_in}</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #38bdf8', borderRadius: 3, p: 2, textAlign: "center" }}>
              <Typography variant="caption" color="#38bdf8">INSIDE MINE</Typography>
              <Typography variant="h4" fontWeight="bold" color="#38bdf8" my={0.5}>{still_in_mine}</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #94a3b8', borderRadius: 3, p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="#94a3b8">CHECKED OUT</Typography>
              <Typography variant="h4" fontWeight="bold" color="#cbd5e1" my={0.5}>{checked_out}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={2.4}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #ef4444', borderRadius: 3, p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="#f87171">ABSENT</Typography>
              <Typography variant="h4" fontWeight="bold" color="#ef4444" my={0.5}>{absent}</Typography>
            </Card>
          </Grid>
        </Grid>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#1e293b' }}>
                <TableRow>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Worker</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Department</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Shift Status</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Shifts Today</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workers.map((w) => (
                  <TableRow key={w.worker_id}>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>{w.name}</TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>{w.department}</TableCell>
                    <TableCell>
                      <Chip
                        label={w.status === 'in_mine' ? 'Inside Mine ⛏️' : (w.status === 'checked_out' ? 'Checked Out ✔' : 'Absent')}
                        color={w.status === 'in_mine' ? 'warning' : (w.status === 'checked_out' ? 'success' : 'default')}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#38bdf8' }}>{w.shifts_today} Shift(s)</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
