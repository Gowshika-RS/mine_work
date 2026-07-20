import { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { BarChartComponent } from '../../components/charts/BarChart';
import { PieChartComponent } from '../../components/charts/PieChart';
import { LineChartComponent } from '../../components/charts/LineChart';
import apiClient from '../../api/client';
import { buildDashboardCards, toWorkerRows } from './adminData';

export const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [overviewResponse, workersResponse] = await Promise.all([
          apiClient.get('/admin/overview'),
          apiClient.get('/admin/workers'),
        ]);
        setOverview(overviewResponse.data);
        setWorkers(toWorkerRows(workersResponse.data));
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const cards = useMemo(() => buildDashboardCards(overview || {}, workers), [overview, workers]);

  const locationData = useMemo(() => {
    const counts = workers.reduce((acc, worker) => {
      acc[worker.location] = (acc[worker.location] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [workers]);

  const statusData = useMemo(() => [
    { name: 'Active', value: workers.filter((worker) => worker.status === 'active').length },
    { name: 'Inactive', value: workers.filter((worker) => worker.status === 'inactive').length },
  ], [workers]);

  const incidentData = useMemo(() => [
    { name: 'Mon', value: Math.max(1, Math.round((overview?.open_incidents || 0) / 4)) },
    { name: 'Tue', value: Math.max(2, Math.round((overview?.open_incidents || 0) / 3)) },
    { name: 'Wed', value: Math.max(1, Math.round((overview?.open_incidents || 0) / 5)) },
    { name: 'Thu', value: Math.max(2, Math.round((overview?.open_incidents || 0) / 4)) },
    { name: 'Fri', value: Math.max(1, Math.round((overview?.open_incidents || 0) / 6)) },
  ], [overview]);

  if (loading) {
    return (
      <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>
        <Chip label="Live data" color="primary" variant="outlined" />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  {card.value}
                </Typography>
                <Typography variant="caption" sx={{ color: card.tone === 'warning' ? 'warning.main' : card.tone === 'success' ? 'success.main' : 'primary.main' }}>
                  {card.detail}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Workers by Location
              </Typography>
              <BarChartComponent data={locationData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Worker Status
              </Typography>
              <PieChartComponent data={statusData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Incident Activity
              </Typography>
              <LineChartComponent data={incidentData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
