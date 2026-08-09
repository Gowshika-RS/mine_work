import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { Assessment as AnalyticsIcon } from '@mui/icons-material';
import { BarChartComponent } from '../../components/charts/BarChart';
import { LineChartComponent } from '../../components/charts/LineChart';
import { PieChartComponent } from '../../components/charts/PieChart';

export default function Analytics() {
  const hazardData = [
    { name: 'Mon', value: 2 },
    { name: 'Tue', value: 4 },
    { name: 'Wed', value: 1 },
    { name: 'Thu', value: 5 },
    { name: 'Fri', value: 3 },
    { name: 'Sat', value: 2 },
    { name: 'Sun', value: 1 },
  ];

  const ppeData = [
    { name: 'Helmet', value: 98.5 },
    { name: 'Vest', value: 97.0 },
    { name: 'Mask', value: 95.0 },
    { name: 'Goggles', value: 96.0 },
  ];

  const incidentPie = [
    { name: 'Gas Hazard', value: 40 },
    { name: 'Equipment', value: 30 },
    { name: 'PPE Violation', value: 20 },
    { name: 'Geofence', value: 10 },
  ];

  return (
    <Box sx={{ py: 2, maxWidth: 1100, mx: 'auto' }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          border: '1px solid #334155'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <AnalyticsIcon sx={{ fontSize: 36, color: '#38bdf8' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Mine Safety Analytics & Predictive Intelligence
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                30-day safety trend charts, hazard frequency analysis, PPE compliance rates, and incident resolution speed
              </Typography>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="#fff" mb={2}>
                📈 Weekly Hazard Reports Trend
              </Typography>
              <BarChartComponent data={hazardData} title="Hazards per Day" />
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="#fff" mb={2}>
                🪖 PPE Verification Pass Rate (%)
              </Typography>
              <BarChartComponent data={ppeData} title="PPE Equipment Breakdown" />
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="#fff" mb={2}>
                📊 Incident Category Distribution
              </Typography>
              <PieChartComponent data={incidentPie} title="Incident Categories" />
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="#fff" mb={2}>
                ⭐ Fleet Average Safety Score Trend
              </Typography>
              <LineChartComponent data={[{ name: 'W1', value: 91 }, { name: 'W2', value: 93 }, { name: 'W3', value: 92 }, { name: 'W4', value: 95 }]} title="Safety Index Trend" />
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
