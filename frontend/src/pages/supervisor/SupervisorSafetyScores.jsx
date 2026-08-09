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
  Alert,
  CircularProgress
} from '@mui/material';
import { BarChart as ScoreIcon } from '@mui/icons-material';
import apiClient from '../../api/client';

export default function SupervisorSafetyScores() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/supervisor/workers');
      setWorkers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch worker safety scores:', err);
      setError('Could not load safety scores for team.');
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
            <ScoreIcon sx={{ fontSize: 36, color: '#22c55e' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Team Personal Safety Score Index
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Worker safety ratings computed from PPE compliance, checklist records, attendance, and hazard reporting
              </Typography>
            </Box>
          </Box>
          <Chip label="Team Avg: 92.5%" color="success" sx={{ fontWeight: 'bold' }} />
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
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Employee ID</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Productivity & Safety Score</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Risk Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workers.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>{w.full_name}</TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>{w.employee_id}</TableCell>
                    <TableCell sx={{ color: '#4ade80', fontWeight: 'bold', fontSize: '1.05rem' }}>
                      {w.productivity_score}%
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={w.risk_indicator}
                        color={w.risk_indicator === 'High Risk' ? 'error' : (w.risk_indicator === 'Medium Risk' ? 'warning' : 'success')}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
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
