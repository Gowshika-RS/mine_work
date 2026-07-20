import { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip, CircularProgress, Alert, Button, Stack } from '@mui/material';
import { BarChartComponent } from '../../components/charts/BarChart';
import { PieChartComponent } from '../../components/charts/PieChart';
import apiClient from '../../api/client';

export const SupervisorDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [overviewRes, workersRes, alertsRes] = await Promise.all([
          apiClient.get('/supervisor/overview'),
          apiClient.get('/supervisor/workers'),
          apiClient.get('/supervisor/hazards/pending'),
        ]);
        setOverview(overviewRes.data);
        setWorkers(workersRes.data);
        setAlerts(alertsRes.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load supervisor data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const riskData = useMemo(() => [
    { name: 'North', value: 12 },
    { name: 'South', value: 7 },
    { name: 'East', value: 9 },
    { name: 'West', value: 5 },
  ], []);

  const cards = [
    { title: 'Live Workers', value: overview?.live_workers ?? 0, detail: 'Tracked in real time' },
    { title: 'Active Shifts', value: overview?.active_shifts ?? 0, detail: 'Open operations' },
    { title: 'Attendance', value: overview?.attendance_today ?? 0, detail: 'Today’s check-ins' },
    { title: 'High Risk', value: overview?.high_risk_workers ?? 0, detail: 'Workers needing review' },
  ];

  if (loading) {
    return <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Supervisor Dashboard</Typography>
        <Chip label="Supervisor role" color="primary" />
      </Box>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>{card.title}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{card.value}</Typography>
                <Typography variant="caption" color="text.secondary">{card.detail}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Zone-wise Risk</Typography>
              <BarChartComponent data={riskData} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Active Alerts</Typography>
              <Stack spacing={1}>
                {alerts.length > 0 ? alerts.map((alert) => (
                  <Box key={alert.id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2">{alert.hazard_type}</Typography>
                    <Typography variant="body2" color="text.secondary">{alert.location}</Typography>
                  </Box>
                )) : <Typography color="text.secondary">No pending alerts</Typography>}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Live Workers</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
                {workers.map((worker) => (
                  <Chip key={worker.id} label={`${worker.full_name} • ${worker.department}`} color={worker.is_active ? 'success' : 'default'} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
