import { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Stack, Alert } from '@mui/material';
import { Campaign, VolumeUp, Warning, CheckCircle } from '@mui/icons-material';
import apiClient from '../../api/client';

export const EmergencyBroadcast = () => {
  const [zone, setZone] = useState('ALL');
  const [alarmType, setAlarmType] = useState('EVACUATION');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await apiClient.post('/emergency-officer/broadcast-alarm', { zone, alarm_type: alarmType, message });
      setSuccess(`🚨 Alarm successfully broadcasted to ${zone}!`);
      setMessage('');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      alert('Broadcast failed');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#0b0f19', minHeight: '100vh', color: '#f8fafc' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Campaign sx={{ color: '#ef4444', fontSize: 36 }} /> Mine Siren & Emergency Broadcast System
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          Transmit audio alarm sirens, push alert blasts & voice evacuation guidelines to all underground workers
        </Typography>
      </Box>

      {success && <Alert severity="error" sx={{ mb: 3, fontWeight: 'bold', bgcolor: '#7f1d1d', color: '#ffffff' }}>{success}</Alert>}

      <Card sx={{ bgcolor: '#151c2c', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', maxWidth: 700, mx: 'auto', p: 2 }}>
        <CardContent>
          <form onSubmit={handleBroadcast}>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94a3b8' }}>Target Mine Zone</InputLabel>
                <Select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  label="Target Mine Zone"
                  sx={{ color: '#ffffff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                >
                  <MenuItem value="ALL">MINE-WIDE (All Underground & Surface Areas)</MenuItem>
                  <MenuItem value="Shaft 1">Shaft 1 Sector</MenuItem>
                  <MenuItem value="Shaft 2">Shaft 2 Deep Excavation</MenuItem>
                  <MenuItem value="Zone B">Zone B Access Tunnel</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94a3b8' }}>Emergency Protocol Type</InputLabel>
                <Select
                  value={alarmType}
                  onChange={(e) => setAlarmType(e.target.value)}
                  label="Emergency Protocol Type"
                  sx={{ color: '#ffffff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                >
                  <MenuItem value="EVACUATION">IMMEDIATE EVACUATION SIREN</MenuItem>
                  <MenuItem value="SHELTER_IN_PLACE">SHELTER IN REFUGE CHAMBER</MenuItem>
                  <MenuItem value="TOXIC_GAS_WARNING">TOXIC GAS CRITICAL ALERT</MenuItem>
                  <MenuItem value="FIRE_ALERT">MINE FIRE EMERGENCY</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Emergency Instruction Text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Attention all personnel: Proceed immediately to Refuge Chamber A or closest egress shaft..."
                InputLabelProps={{ style: { color: '#94a3b8' } }}
                InputProps={{ style: { color: '#ffffff' } }}
              />

              <Button
                type="submit"
                variant="contained"
                color="error"
                size="large"
                startIcon={<VolumeUp />}
                sx={{ py: 1.5, fontWeight: '800', fontSize: '1.05rem', borderRadius: 2.5 }}
              >
                SOUND EMERGENCY ALARM & BROADCAST
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};
