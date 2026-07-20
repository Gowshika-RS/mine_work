import { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, InputAdornment, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Chip, CircularProgress, Alert } from '@mui/material';
import { Search } from '@mui/icons-material';
import apiClient from '../../api/client';

export const SupervisorWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        const response = await apiClient.get('/supervisor/workers');
        setWorkers(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load workers');
      } finally {
        setLoading(false);
      }
    };

    loadWorkers();
  }, []);

  const filtered = useMemo(() => workers.filter((worker) => `${worker.full_name} ${worker.department} ${worker.email}`.toLowerCase().includes(search.toLowerCase())), [workers, search]);

  if (loading) return <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Supervisor Workers</Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField fullWidth value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search workers" InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
        </CardContent>
      </Card>
      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Risk Score</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((worker) => (
              <TableRow key={worker.id}>
                <TableCell>{worker.full_name}</TableCell>
                <TableCell>{worker.department}</TableCell>
                <TableCell>{worker.email}</TableCell>
                <TableCell>{worker.safety_score.toFixed(1)}%</TableCell>
                <TableCell><Chip label={worker.is_active ? 'active' : 'inactive'} color={worker.is_active ? 'success' : 'default'} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
