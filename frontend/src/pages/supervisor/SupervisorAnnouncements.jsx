import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Stack, Alert, CircularProgress } from '@mui/material';
import apiClient from '../../api/client';

export const SupervisorAnnouncements = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('info');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      await apiClient.post('/supervisor/announcements', { title, message, priority });
      setStatus('Announcement created');
      setTitle('');
      setMessage('');
      setPriority('info');
    } catch (err) {
      setStatus(err.response?.data?.detail || 'Unable to create announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Safety Announcements</Typography>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            {status && <Alert severity={status.includes('Unable') ? 'error' : 'success'}>{status}</Alert>}
            <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <TextField label="Message" multiline minRows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
            <TextField label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} />
            <Button variant="contained" onClick={handleSend} disabled={loading}>{loading ? 'Sending...' : 'Create Announcement'}</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
