import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Button, Alert, CircularProgress } from '@mui/material';
import apiClient from '../../api/client';

export const SupervisorHazards = () => {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const response = await apiClient.get('/supervisor/hazards/pending');
      setHazards(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load hazard reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try {
      await apiClient.post(`/supervisor/hazards/${id}/approve`);
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to approve hazard');
    }
  };

  if (loading) return <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Hazard Reports</Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hazards.map((hazard) => (
              <TableRow key={hazard.id}>
                <TableCell>{hazard.hazard_type}</TableCell>
                <TableCell>{hazard.location}</TableCell>
                <TableCell>{hazard.description}</TableCell>
                <TableCell><Button variant="contained" size="small" onClick={() => approve(hazard.id)}>Approve</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
