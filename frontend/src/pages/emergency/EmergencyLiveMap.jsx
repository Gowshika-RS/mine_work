import { useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Stack, Button } from '@mui/material';
import { GpsFixed, Map, Shield, Warning, LocalHospital, Navigation } from '@mui/icons-material';

export const EmergencyLiveMap = () => {
  const [selectedZone, setSelectedZone] = useState('ALL');

  const zones = [
    { name: 'Shaft 1 Entrance', status: 'SAFE', workers: 14, rescueTeams: 1 },
    { name: 'Shaft 2 Deep Mining', status: 'DANGER', workers: 8, rescueTeams: 2, hazard: 'Methane Gas Spike (3.8%)' },
    { name: 'Zone B Access Tunnel', status: 'WARNING', workers: 12, rescueTeams: 1, hazard: 'Rockfall Warning' },
    { name: 'Refuge Chamber A', status: 'SAFE', workers: 10, rescueTeams: 0 },
    { name: 'Refuge Chamber B', status: 'SAFE', workers: 4, rescueTeams: 0 }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#0b0f19', minHeight: '100vh', color: '#f8fafc' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Map sx={{ color: '#38bdf8', fontSize: 36 }} /> Mine Rescue & Evacuation Live Map
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          Real-time worker telemetry pinpoints, refuge chambers, rescue team locations & evacuation pathing
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Map View Area */}
        <Grid item xs={12} md={8}>
          <Card sx={{ bgcolor: '#151c2c', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', minHeight: 480, p: 3, position: 'relative' }}>
            <Box sx={{
              height: 420, borderRadius: 2, bgcolor: '#0f172a',
              border: '2px dashed rgba(56, 189, 248, 0.3)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              position: 'relative', overflow: 'hidden'
            }}>
              {/* Overlay Grid lines for HUD map simulation */}
              <Box sx={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

              <GpsFixed sx={{ color: '#38bdf8', fontSize: 64, animation: 'pulse 2s infinite' }} />
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#ffffff' }}>
                UNDERGROUND SECTOR RADAR & RESCUE MAP
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', maxWidth: 450 }}>
                Live coordinates active: 48 Personnel tracked. 3 Emergency beacons glowing in Sector 2 & Zone B. Evacuation routes illuminated.
              </Typography>

              <Stack direction="row" spacing={2} sx={{ zIndex: 1 }}>
                <Chip icon={<Shield color="success" />} label="Refuge Chamber A: Clear" color="success" variant="outlined" />
                <Chip icon={<Warning color="error" />} label="Shaft 2: Evacuation Active" color="error" />
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* Sector Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#151c2c', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="700" sx={{ mb: 2, color: '#ffffff' }}>
                Mine Zones & Victim Locations
              </Typography>

              <Stack spacing={2}>
                {zones.map((z, idx) => (
                  <Box key={idx} sx={{ p: 2, borderRadius: 2, bgcolor: z.status === 'DANGER' ? 'rgba(239,68,68,0.15)' : z.status === 'WARNING' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)', borderLeft: z.status === 'DANGER' ? '4px solid #ef4444' : z.status === 'WARNING' ? '4px solid #f59e0b' : '4px solid #10b981' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#ffffff' }}>{z.name}</Typography>
                      <Chip label={z.status} size="small" color={z.status === 'DANGER' ? 'error' : z.status === 'WARNING' ? 'warning' : 'success'} sx={{ fontWeight: 'bold' }} />
                    </Stack>
                    <Typography variant="caption" sx={{ color: '#cbd5e1', display: 'block', mt: 0.5 }}>
                      Workers Present: {z.workers} | Rescue Squads: {z.rescueTeams}
                    </Typography>
                    {z.hazard && (
                      <Typography variant="caption" sx={{ color: '#fca5a5', fontWeight: 'bold', display: 'block', mt: 0.5 }}>
                        🚨 Threat: {z.hazard}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
