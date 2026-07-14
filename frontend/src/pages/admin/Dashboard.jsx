import { Box, Grid, Card, CardContent, Typography, Button, LinearProgress } from '@mui/material';
import { BarChartComponent } from '../../components/charts/BarChart';
import { PieChartComponent } from '../../components/charts/PieChart';
import { LineChartComponent } from '../../components/charts/LineChart';

export const AdminDashboard = () => {
  const workersData = [
    { name: 'Plant A', value: 45 },
    { name: 'Plant B', value: 38 },
    { name: 'Plant C', value: 32 },
    { name: 'Warehouse', value: 28 },
  ];

  const incidentData = [
    { name: 'Week 1', value: 12 },
    { name: 'Week 2', value: 19 },
    { name: 'Week 3', value: 15 },
    { name: 'Week 4', value: 8 },
  ];

  const statusData = [
    { name: 'Active', value: 85 },
    { name: 'On Break', value: 32 },
    { name: 'Offline', value: 8 },
  ];

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Workers
              </Typography>
              <Typography variant="h5" sx={{ mb: 1 }}>
                143
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.main' }}>
                ↑ 5% this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Workers
              </Typography>
              <Typography variant="h5" sx={{ mb: 1 }}>
                85
              </Typography>
              <LinearProgress variant="determinate" value={59} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Incidents This Week
              </Typography>
              <Typography variant="h5" sx={{ color: 'warning.main' }}>
                8
              </Typography>
              <Typography variant="caption">
                ↓ 2 from last week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Safety Score
              </Typography>
              <Typography variant="h5" sx={{ color: 'success.main' }}>
                88%
              </Typography>
              <LinearProgress variant="determinate" value={88} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Workers by Location
              </Typography>
              <BarChartComponent data={workersData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Current Status
              </Typography>
              <PieChartComponent data={statusData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Incident Trends
              </Typography>
              <LineChartComponent data={incidentData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
