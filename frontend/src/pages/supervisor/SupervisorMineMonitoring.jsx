import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Alert, Chip, LinearProgress, Button } from '@mui/material';
import { Sensors, Warning, Refresh, TrendingUp, TrendingDown, Remove } from '@mui/icons-material';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import apiClient from '../../api/client';

export const SupervisorMineMonitoring = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSensors = async () => {
    try {
      const res = await apiClient.get('/supervisor/mine-sensors');
      setSensors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
    const interval = setInterval(fetchSensors, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary">Mine Environmental Monitoring</Typography>
          <Typography variant="body2" color="text.secondary">Real-time telemetry from atmospheric & structural IoT sensors</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchSensors}>Refresh Sensors</Button>
      </Box>

      <Grid container spacing={2.5}>
        {sensors.map((s) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={s.id}>
            <Card sx={{
              borderRadius: 3, border: '1px solid',
              borderColor: s.is_safe ? 'divider' : 'error.main',
              boxShadow: s.is_safe ? 'none' : '0 4px 12px rgba(244,67,54,0.15)'
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.zone}</Typography>
                  <Chip
                    label={s.is_safe ? 'SAFE' : 'ALERT'}
                    color={s.is_safe ? 'success' : 'error'}
                    size="small"
                    sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                  />
                </Box>

                <Typography variant="subtitle2" fontWeight={700} noWrap>{s.name}</Typography>
                <Typography variant="h4" fontWeight={800} color={s.is_safe ? 'text.primary' : 'error.main'} sx={{ my: 0.5 }}>
                  {s.current} <Typography component="span" variant="caption" color="text.secondary">{s.unit}</Typography>
                </Typography>

                <Typography variant="caption" color="text.secondary" display="block">
                  Safe Range: {s.safe_min} - {s.safe_max} {s.unit}
                </Typography>

                {/* Mini Sparkline */}
                <Box sx={{ height: 35, my: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={s.history.map(v => ({ v }))}>
                      <Line type="monotone" dataKey="v" stroke={s.is_safe ? '#4caf50' : '#f44336'} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {s.trend === 'up' ? <TrendingUp sx={{ fontSize: 14, color: 'error.main' }} /> :
                     s.trend === 'down' ? <TrendingDown sx={{ fontSize: 14, color: 'success.main' }} /> :
                     <Remove sx={{ fontSize: 14, color: 'text.secondary' }} />}
                    <Typography variant="caption" color="text.secondary">{s.trend_pct}%</Typography>
                  </Box>
                  {s.warning && <Typography variant="caption" color="error" fontWeight={700}>{s.warning}</Typography>}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
