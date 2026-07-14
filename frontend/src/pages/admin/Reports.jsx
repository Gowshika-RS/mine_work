import { Box, Card, CardContent, Typography, Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { BarChartComponent } from '../../components/charts/BarChart';
import { LineChartComponent } from '../../components/charts/LineChart';
import { PieChartComponent } from '../../components/charts/PieChart';
import { Download, Print } from '@mui/icons-material';
import { useState } from 'react';

export const Reports = () => {
  const [reportType, setReportType] = useState('incidents');
  const [dateRange, setDateRange] = useState('month');

  const incidentData = [
    { name: 'Week 1', value: 12 },
    { name: 'Week 2', value: 19 },
    { name: 'Week 3', value: 15 },
    { name: 'Week 4', value: 8 },
  ];

  const departmentData = [
    { name: 'Manufacturing', value: 34 },
    { name: 'Warehouse', value: 28 },
    { name: 'Maintenance', value: 18 },
    { name: 'Lab', value: 12 },
  ];

  const trendData = [
    { name: 'Jan', value: 45 },
    { name: 'Feb', value: 52 },
    { name: 'Mar', value: 48 },
    { name: 'Apr', value: 61 },
    { name: 'May', value: 55 },
    { name: 'Jun', value: 39 },
  ];

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Reports
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Print />}>
            Print
          </Button>
          <Button variant="contained" startIcon={<Download />}>
            Export
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  label="Report Type"
                >
                  <MenuItem value="incidents">Incidents</MenuItem>
                  <MenuItem value="safety">Safety Score</MenuItem>
                  <MenuItem value="hazards">Hazards</MenuItem>
                  <MenuItem value="workers">Workers Activity</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  label="Date Range"
                >
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="quarter">This Quarter</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Incidents Trend
              </Typography>
              <BarChartComponent data={incidentData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Incidents by Department
              </Typography>
              <PieChartComponent data={departmentData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Monthly Incident Trend
              </Typography>
              <LineChartComponent data={trendData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
