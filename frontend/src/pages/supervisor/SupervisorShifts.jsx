import { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, Stack } from '@mui/material';
import apiClient from '../../api/client';

export const SupervisorShifts = () => {
  const [workerId, setWorkerId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAssign = async () => {
    try {
      await apiClient.post('/supervisor/shifts/assign', {
        worker_id: Number(workerId),
        start_time: new Date(startTime).toISOString(),
      });
      setMessage('Shift assigned successfully');
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to assign shift');
      setMessage('');
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Assign Shifts</Typography>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}
            <TextField label="Worker ID" value={workerId} onChange={(e) => setWorkerId(e.target.value)} />
            <TextField label="Start Time" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} InputLabelProps={{ shrink: true }} />
            <Button variant="contained" onClick={handleAssign}>Assign Shift</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
