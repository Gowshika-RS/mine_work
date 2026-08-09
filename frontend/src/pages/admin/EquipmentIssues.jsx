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
  Alert,
  CircularProgress,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import {
  Build as EquipmentIcon,
  ReportProblem as WarningIcon,
  CheckCircle as ResolvedIcon
} from '@mui/icons-material';
import apiClient from '../../api/client';

export default function EquipmentIssues() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEquipmentReports();
  }, []);

  const fetchEquipmentReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/equipment/reports');
      if (res.data && res.data.reports) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error('Failed to load equipment reports:', err);
      setError('Failed to fetch equipment issue reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await apiClient.put(`/equipment/reports/${reportId}/status`, { status_val: newStatus });
      fetchEquipmentReports();
    } catch (err) {
      console.error('Failed to update status:', err);
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
            <EquipmentIcon sx={{ fontSize: 36, color: '#eab308' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Equipment Issues & Maintenance Management
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Track worker-reported equipment failures (Drills, Helmets, Gas Sensors, Hoist Ropes) and assign technicians
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
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Equipment & ID</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Reported By</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Location</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Priority</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Status Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length > 0 ? (
                  reports.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="#fff">
                          {row.equipment_name || row.category}
                        </Typography>
                        <Typography variant="caption" color="#94a3b8">
                          {row.equipment_id}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ color: '#fff' }}>{row.reported_by || 'Worker'}</TableCell>

                      <TableCell sx={{ color: '#94a3b8' }}>{row.location}</TableCell>

                      <TableCell>
                        <Chip
                          label={row.urgency || row.priority}
                          color={row.urgency === 'Critical' || row.priority === 'Critical' ? 'error' : 'warning'}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>

                      <TableCell sx={{ color: '#e2e8f0', maxWidth: 260 }}>
                        <Typography variant="body2" noWrap title={row.description}>
                          {row.description}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 130, bgcolor: '#1e293b', borderRadius: 1 }}>
                          <Select
                            value={row.status || 'Submitted'}
                            onChange={(e) => handleStatusChange(row.id, e.target.value)}
                            sx={{ color: '#fff', fontSize: '0.85rem' }}
                          >
                            <MenuItem value="Submitted">Submitted</MenuItem>
                            <MenuItem value="Under Review">Under Review</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Resolved">Resolved</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: '#94a3b8', py: 3 }}>
                      No equipment issues reported.
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
