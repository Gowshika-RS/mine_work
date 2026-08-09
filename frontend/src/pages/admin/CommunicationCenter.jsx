import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  Alert,
  Stack,
  Avatar
} from '@mui/material';
import {
  Message as ChatIcon,
  Send as SendIcon,
  Campaign as BroadcastIcon,
  Emergency as EmergencyIcon
} from '@mui/icons-material';

export default function CommunicationCenter() {
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [sentAlert, setSentAlert] = useState('');

  const handleSendBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    setSentAlert(`Broadcast dispatched: "${broadcastMsg}"`);
    setBroadcastMsg('');
    setTimeout(() => setSentAlert(''), 4000);
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
            <ChatIcon sx={{ fontSize: 36, color: '#0288d1' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Command Communication & Broadcast Center
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Direct worker/supervisor messaging, emergency broadcasts, and sector announcements
              </Typography>
            </Box>
          </Box>
        </Box>

        {sentAlert && <Alert severity="success" sx={{ mb: 2 }}>{sentAlert}</Alert>}

        <Grid container spacing={3}>
          {/* Emergency Broadcast Sender */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #dc2626', borderRadius: 3, p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <BroadcastIcon sx={{ color: '#ef4444', fontSize: 30 }} />
                <Typography variant="h6" fontWeight="bold" color="#fff">
                  🚨 Send Emergency Sector Announcement
                </Typography>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Example: 'All workers in Sector B must evacuate to Refuge Chamber B immediately.'"
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                sx={{ mb: 2, bgcolor: '#1e293b', borderRadius: 1, input: { color: '#fff' }, textarea: { color: '#fff' } }}
              />

              <Button
                variant="contained"
                color="error"
                fullWidth
                startIcon={<SendIcon />}
                onClick={handleSendBroadcast}
                sx={{ py: 1.2, fontWeight: 'bold' }}
              >
                Broadcast Mine-Wide Emergency Alert
              </Button>
            </Card>
          </Grid>

          {/* Active Conversations Preview */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2.5 }}>
              <Typography variant="h6" fontWeight="bold" color="#fff" mb={2}>
                💬 Active Conversations & Supervisors
              </Typography>

              <Stack spacing={1.5}>
                {[
                  { name: 'Dave Safety (Supervisor)', msg: 'Geotechnical team inspects mesh bolts at Shaft 3.', time: '10 mins ago', status: 'Online' },
                  { name: 'John Miner (Worker)', msg: 'Finished pre-shift checklist. Heading to Level 2.', time: '25 mins ago', status: 'In Mine' },
                  { name: 'Maintenance Crew 2', msg: 'Haul truck CAT 777 brake pressure issue assigned.', time: '40 mins ago', status: 'Assigned' }
                ].map((chat, idx) => (
                  <Paper key={idx} sx={{ p: 1.5, bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ bgcolor: '#0284c7', width: 36, height: 36 }}>{chat.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold" color="#fff">{chat.name}</Typography>
                        <Typography variant="caption" color="#94a3b8" noWrap display="block">{chat.msg}</Typography>
                      </Box>
                    </Box>
                    <Chip label={chat.status} color="info" size="small" />
                  </Paper>
                ))}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
