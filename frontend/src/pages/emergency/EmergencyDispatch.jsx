import { useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Button, Stack, Avatar } from '@mui/material';
import { LocalHospital, GroupWork, Phone, CheckCircle, Warning } from '@mui/icons-material';

export const EmergencyDispatch = () => {
  const teams = [
    { id: 1, name: 'Alpha Rescue Squad', leader: 'Captain J. Vance', status: 'AVAILABLE', members: 5, zone: 'Shaft 1 Base', phone: '+1-555-0191' },
    { id: 2, name: 'Bravo Medical Response', leader: 'Dr. E. Rigby', status: 'ON_STANDBY', members: 4, zone: 'Medical Station A', phone: '+1-555-0192' },
    { id: 3, name: 'Charlie Gas & Hazmat Squad', leader: 'Eng. R. Miller', status: 'AVAILABLE', members: 6, zone: 'Ventilation Hub 2', phone: '+1-555-0193' },
    { id: 4, name: 'Delta Heavy Extrication Unit', leader: 'Lt. K. Thorne', status: 'DISPATCHED', members: 4, zone: 'Shaft 2 Level 4', phone: '+1-555-0194' }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#0b0f19', minHeight: '100vh', color: '#f8fafc' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LocalHospital sx={{ color: '#10b981', fontSize: 36 }} /> Mine Rescue Squad & First Responder Dispatch
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          Deploy specialized underground rescue teams, paramedic responders, and extrication units
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {teams.map((t) => (
          <Grid item xs={12} sm={6} key={t.id}>
            <Card sx={{ bgcolor: '#151c2c', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#6ee7b7' }}>{t.name}</Typography>
                  <Chip
                    label={t.status}
                    color={t.status === 'AVAILABLE' ? 'success' : t.status === 'DISPATCHED' ? 'error' : 'warning'}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Stack>

                <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 0.5 }}>
                  <strong>Squad Leader:</strong> {t.leader} ({t.members} Members)
                </Typography>
                <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 0.5 }}>
                  <strong>Staging Zone:</strong> {t.zone}
                </Typography>
                <Typography variant="body2" sx={{ color: '#38bdf8', mb: 2 }}>
                  <strong>Emergency Hotline:</strong> {t.phone}
                </Typography>

                <Stack direction="row" spacing={1.5}>
                  <Button variant="contained" color="error" fullWidth startIcon={<LocalHospital />}>
                    Deploy to SOS
                  </Button>
                  <Button variant="outlined" color="info" fullWidth startIcon={<Phone />}>
                    Contact Leader
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
