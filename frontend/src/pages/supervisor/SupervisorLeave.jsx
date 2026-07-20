import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Button, Alert, CircularProgress } from '@mui/material';
import apiClient from '../../api/client';

export const SupervisorLeave = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const response = await apiClient.get('/supervisor/leave-requests');
      setRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try {
      await apiClient.post(`/supervisor/leave-requests/${id}/approve`);
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to approve leave');
    }
  };

  if (loading) return <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Leave Requests</Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Worker ID</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.worker_id}</TableCell>
                <TableCell>{request.reason}</TableCell>
                <TableCell>{request.start_date} → {request.end_date}</TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>
                  {request.status !== 'approved' && <Button variant="contained" size="small" onClick={() => approve(request.id)}>Approve</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
