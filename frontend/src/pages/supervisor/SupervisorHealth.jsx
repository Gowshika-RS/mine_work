import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Alert, CircularProgress } from '@mui/material';
import apiClient from '../../api/client';

export const SupervisorHealth = () => {
  const [health, setHealth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiClient.get('/supervisor/health');
        setHealth(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load health overview');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Worker Health</Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Safety Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {health.map((entry) => (
              <TableRow key={entry.worker_id}>
                <TableCell>{entry.name}</TableCell>
                <TableCell>{entry.department}</TableCell>
                <TableCell>{entry.safety_score.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
