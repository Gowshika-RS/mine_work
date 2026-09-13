import { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Avatar, Stack } from '@mui/material';
import { Person, Shield, LocalHospital, Phone } from '@mui/icons-material';

export const EmergencyProfile = () => {
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : { username: 'emergency_officer', role: 'emergency_officer' };
    } catch {
      return { username: 'emergency_officer', role: 'emergency_officer' };
    }
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#0b0f19', minHeight: '100vh', color: '#f8fafc' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Shield sx={{ color: '#ef4444', fontSize: 36 }} /> Emergency Commander Profile
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          Official credentials & hotline dispatch contacts
        </Typography>
      </Box>

      <Grid container spacing={3} maxWidth={800}>
        <Grid item xs={12}>
          <Card sx={{ bgcolor: '#151c2c', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', p: 3, color: '#ffffff' }}>
            <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: '#ef4444', fontSize: 36, fontWeight: 'bold' }}>
                EO
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">{user.username.toUpperCase()}</Typography>
                <Typography variant="body2" sx={{ color: '#fca5a5', fontWeight: 'bold' }}>
                  ROLE: EMERGENCY OFFICER / RESCUE COMMANDER
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Mine Operations Incident Command Center &bull; Authorized for Sirens & Dispatches
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Officer Username" value={user.username} disabled InputLabelProps={{ style: { color: '#94a3b8' } }} InputProps={{ style: { color: '#ffffff' } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Official Email" value="emergency@minesafety.com" disabled InputLabelProps={{ style: { color: '#94a3b8' } }} InputProps={{ style: { color: '#ffffff' } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Direct Rescue Hotline" value="+1 (555) 911-MINE" disabled InputLabelProps={{ style: { color: '#94a3b8' } }} InputProps={{ style: { color: '#ffffff' } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Clearance Level" value="LEVEL 5 - FULL EMERGENCY COMMAND" disabled InputLabelProps={{ style: { color: '#94a3b8' } }} InputProps={{ style: { color: '#ffffff' } }} />
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
