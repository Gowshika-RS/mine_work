import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { HealthAndSafety as PPEIcon, CheckCircle as CheckIcon, Cancel as CancelIcon } from '@mui/icons-material';
import apiClient from '../../api/client';

export default function SupervisorPPEMonitoring() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPPEMetrics();
  }, []);

  const fetchPPEMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/supervisor/ppe-monitoring');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch supervisor PPE metrics:', err);
      setError('Could not load PPE compliance statistics.');
    } finally {
      setLoading(false);
    }
  };

  const { compliance_rate = 96.5, recent_logs = [] } = data || {};

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
            <PPEIcon sx={{ fontSize: 36, color: '#4ade80' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Team PPE Compliance Monitoring
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Monitor camera-verified Helmet, Vest, Mask, and Goggles compliance for assigned workers
              </Typography>
            </Box>
          </Box>
          <Chip label={`${compliance_rate}% Team Pass Rate`} color="success" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }} />
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
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Worker</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Timestamp</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>PPE Verification</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Confidence Score</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Missing Equipment</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recent_logs.length > 0 ? (
                  recent_logs.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>{row.worker_name}</TableCell>
                      <TableCell sx={{ color: '#94a3b8' }}>{row.timestamp}</TableCell>
                      <TableCell>
                        <Chip
                          icon={row.passed ? <CheckIcon /> : <CancelIcon />}
                          label={row.passed ? 'PASSED ✔' : 'FAILED ❌'}
                          color={row.passed ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#38bdf8', fontWeight: 'bold' }}>{row.confidence_score}%</TableCell>
                      <TableCell sx={{ color: '#f87171' }}>
                        {row.missing_equipment && row.missing_equipment.length > 0 ? row.missing_equipment.join(', ') : 'None'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: '#94a3b8', py: 3 }}>
                      No PPE scans recorded today.
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
