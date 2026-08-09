import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Alert, Chip, Avatar, Button, Stack, Divider, LinearProgress } from '@mui/material';
import { Favorite, Thermostat, WaterDrop, HealthAndSafety, LocalHospital, Refresh, Lightbulb } from '@mui/icons-material';
import apiClient from '../../api/client';

const getAiBadge = (rec) => {
  switch (rec) {
    case 'medical_attention': return { label: 'Medical Attention Required', color: 'error' };
    case 'take_break': return { label: 'Take Break Suggested', color: 'warning' };
    case 'drink_water': return { label: 'Hydration Needed', color: 'info' };
    default: return { label: 'Continue Work', color: 'success' };
  }
};

export const SupervisorHealthMonitoring = () => {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const res = await apiClient.get('/supervisor/health');
      setHealthData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary">Worker Health Monitoring</Typography>
          <Typography variant="body2" color="text.secondary">Real-time biometric health telemetry & AI intervention recommendations</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchHealth}>Refresh Telemetry</Button>
      </Box>

      <Grid container spacing={3}>
        {healthData.map((h) => {
          const ai = getAiBadge(h.ai_recommendation);
          return (
            <Grid item xs={12} md={6} lg={4} key={h.worker_id}>
              <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700 }}>{h.worker_name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>{h.worker_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{h.employee_id} • {h.department}</Typography>
                      </Box>
                    </Box>
                    <Chip label={`Index: ${h.health_index}/100`} color={h.health_index > 75 ? 'success' : 'warning'} size="small" />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Heart Rate</Typography>
                      <Typography variant="body2" fontWeight={700}>{h.heart_rate} bpm</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Temp</Typography>
                      <Typography variant="body2" fontWeight={700}>{h.temperature}°C</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">SpO₂</Typography>
                      <Typography variant="body2" fontWeight={700}>{h.spo2}%</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Stress Level</Typography>
                      <Typography variant="body2" fontWeight={700}>{h.stress_level}/10</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Fatigue</Typography>
                      <Typography variant="body2" fontWeight={700}>{h.fatigue_level}/10</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Hydration</Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ textTransform: 'capitalize' }}>{h.hydration_status}</Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ p: 1.5, bgcolor: `${ai.color}.lighter`, borderRadius: 2, border: '1px solid', borderColor: `${ai.color}.light` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Lightbulb color={ai.color} fontSize="small" />
                      <Typography variant="caption" fontWeight={700} color={`${ai.color}.main`}>AI Recommendation:</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>{ai.label}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
