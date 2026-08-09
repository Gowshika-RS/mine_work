import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
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
import { Build as EquipmentIcon } from '@mui/icons-material';
import apiClient from '../../api/client';

export default function SupervisorEquipment() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/equipment/reports');
      if (res.data && res.data.reports) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error('Failed to fetch equipment reports:', err);
      setError('Could not fetch equipment reports for assigned team.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await apiClient.put(`/equipment/reports/${reportId}/status`, { status_val: newStatus });
      fetchEquipment();
    } catch (err) {
      console.error('Failed to update equipment status:', err);
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
        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
          <EquipmentIcon sx={{ fontSize: 36, color: '#eab308' }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Team Equipment Issue Management
            </Typography>
            <Typography variant="body2" color="#94a3b8">
              Verify equipment failures reported by assigned workers, assign technicians, and track resolution status
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#1e293b' }}>
                <TableRow>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Equipment</TableCell>
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
                      <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>{row.equipment_name || row.category}</TableCell>
                      <TableCell sx={{ color: '#38bdf8' }}>{row.reported_by || 'Assigned Worker'}</TableCell>
                      <TableCell sx={{ color: '#94a3b8' }}>{row.location}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.urgency || row.priority}
                          color={row.urgency === 'Critical' || row.priority === 'Critical' ? 'error' : 'warning'}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#cbd5e1', maxWidth: 250 }}>{row.description}</TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120, bgcolor: '#1e293b', borderRadius: 1 }}>
                          <Select
                            value={row.status || 'Submitted'}
                            onChange={(e) => handleStatusChange(row.id, e.target.value)}
                            sx={{ color: '#fff', fontSize: '0.85rem' }}
                          >
                            <MenuItem value="Submitted">Submitted</MenuItem>
                            <MenuItem value="Under Review">Under Review</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Resolved">Resolved</MenuItem>
                            <MenuItem value="Escalated">Escalated</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: '#94a3b8', py: 3 }}>
                      No open equipment issues reported by team.
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
