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
  BarChart as ScoreIcon,
  Shield as ShieldIcon,
  CheckCircle as ExcellentIcon,
  Warning as RiskIcon
} from '@mui/icons-material';
import apiClient from '../../api/client';

export default function SafetyScores() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSafetyScores();
  }, []);

  const fetchSafetyScores = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/workers');
      setWorkers(res.data || []);
    } catch (err) {
      console.error('Failed to load safety scores:', err);
      setError('Could not fetch worker safety scores.');
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
                Mine-Wide Personal Safety Scores Dashboard
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Worker safety index ratings, PPE compliance impact, checklist records, and low-performing risk identification
              </Typography>
            </Box>
          </Box>

          <Chip label="Average Safety Score: 92.5%" color="success" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }} />
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
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Department</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Safety Score</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Tier Classification</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workers.map((w) => {
                  const score = w.profile?.safety_score || 95.0;
                  const tier = score >= 90 ? 'Excellent' : (score >= 70 ? 'Good' : 'Needs Improvement');
                  const color = score >= 90 ? 'success' : (score >= 70 ? 'warning' : 'error');
                  return (
                    <TableRow key={w.id}>
                      <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>{w.profile?.full_name || w.username}</TableCell>
                      <TableCell sx={{ color: '#94a3b8' }}>{w.profile?.employee_id || `EMP-${w.id}`}</TableCell>
                      <TableCell sx={{ color: '#38bdf8' }}>{w.profile?.department || 'Operations'}</TableCell>
                      <TableCell sx={{ color: score >= 90 ? '#4ade80' : '#facc15', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {score}%
                      </TableCell>
                      <TableCell>
                        <Chip label={tier} color={color} size="small" sx={{ fontWeight: 'bold' }} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
