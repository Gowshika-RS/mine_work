import { useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Button, Stack, Alert } from '@mui/material';
import { Warning, ReportProblem, Campaign, CheckCircle } from '@mui/icons-material';

export const EmergencyHazards = () => {
  const hazards = [
    { id: 809, type: 'Structural Collapse Risk', severity: 'critical', location: 'Shaft 2 Level 4', reporter: 'John Miner', desc: 'Support beams cracking after vibration surge.', status: 'OPEN' },
    { id: 808, type: 'Methane Gas Spike (3.8%)', severity: 'critical', location: 'Zone B Ventilation Shaft', reporter: 'Sensor Node #12', desc: 'Gas levels exceeded maximum safe limits.', status: 'OPEN' },
    { id: 805, type: 'Underground Water Ingress', severity: 'high', location: 'Shaft 1 Excavation Face', reporter: 'Dave Vance', desc: 'Water seepage accelerating from northern wall.', status: 'UNDER_REVIEW' }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#0b0f19', minHeight: '100vh', color: '#f8fafc' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Warning sx={{ color: '#f59e0b', fontSize: 36 }} /> Critical Hazards & Disaster Response Hub
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          Evaluate high-severity mine anomalies, issue sector lockdowns & trigger emergency evacuations
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {hazards.map((h) => (
          <Grid item xs={12} md={6} key={h.id}>
            <Card sx={{ bgcolor: '#151c2c', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#fde68a' }}>
                    HAZARD #{h.id} — {h.type}
                  </Typography>
                  <Chip label={h.severity.toUpperCase()} color="error" size="small" sx={{ fontWeight: 'bold' }} />
                </Stack>

                <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1 }}>
                  <strong>Location:</strong> {h.location} | <strong>Source:</strong> {h.reporter}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                  {h.desc}
                </Typography>

                <Stack direction="row" spacing={1.5}>
                  <Button variant="contained" color="error" size="small" startIcon={<Campaign />}>
                    Evacuate Zone
                  </Button>
                  <Button variant="outlined" color="success" size="small" startIcon={<CheckCircle />}>
                    Mark Resolved
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
