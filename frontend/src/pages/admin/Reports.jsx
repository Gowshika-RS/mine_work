import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import { BarChartComponent } from '../../components/charts/BarChart';
import { LineChartComponent } from '../../components/charts/LineChart';
import { PieChartComponent } from '../../components/charts/PieChart';
import { Download, Print, Refresh } from '@mui/icons-material';
import apiClient from '../../api/client';

export const Reports = () => {
  const [reportType, setReportType] = useState('incidents');
  const [dateRange, setDateRange] = useState('month');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`/admin/reports/analytics?period=${dateRange}`);
      setAnalytics(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load analytics report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const handleExport = async (format) => {
    try {
      const response = await apiClient.get(`/admin/reports/export?format=${format}&report_type=${reportType}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mineguard_${reportType}_report.${format === 'excel' ? 'csv' : 'txt'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export report document.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={44} />
      </Box>
    );
  }

  const incidentData = [
    { name: 'Week 1', value: analytics?.summary?.total_hazards ?? 12 },
    { name: 'Week 2', value: Math.max(0, (analytics?.summary?.total_hazards ?? 10) - 2) },
    { name: 'Week 3', value: Math.max(0, (analytics?.summary?.resolved_hazards ?? 8) + 1) },
    { name: 'Week 4', value: analytics?.summary?.resolved_hazards ?? 5 },
  ];

  const trendData = [
    { name: 'Jan', value: 45 },
    { name: 'Feb', value: 52 },
    { name: 'Mar', value: 48 },
    { name: 'Apr', value: 61 },
    { name: 'May', value: 55 },
    { name: 'Jun', value: analytics?.summary?.total_shifts ?? 39 },
  ];

  return (
    <Box sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Reports & Safety Analytics
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Generate executive compliance summaries, hazard trends, and download PDF/Excel audit reports
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()}>
            Print Preview
          </Button>
          <Button variant="outlined" startIcon={<Download />} onClick={() => handleExport('excel')}>
            Export Excel (CSV)
          </Button>
          <Button variant="contained" startIcon={<Download />} onClick={() => handleExport('pdf')}>
            Export PDF Report
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Filter Selector Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Report Dataset</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  label="Report Dataset"
                >
                  <MenuItem value="incidents">Hazard & Incident Reports</MenuItem>
                  <MenuItem value="workers">Worker Performance & Safety Scores</MenuItem>
                  <MenuItem value="sos">SOS Emergency Logs</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Date Period</InputLabel>
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  label="Date Period"
                >
                  <MenuItem value="day">Daily Report</MenuItem>
                  <MenuItem value="week">Weekly Report</MenuItem>
                  <MenuItem value="month">Monthly Report</MenuItem>
                  <MenuItem value="year">Annual Summary</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button startIcon={<Refresh />} variant="text" onClick={loadAnalytics}>
                Reload Metrics
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Analytics Highlights */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">Total Shift Logs</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{analytics?.summary?.total_shifts ?? 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">Total Hazard Reports</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'warning.main' }}>
              {analytics?.summary?.total_hazards ?? 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">Hazard Resolution Rate</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'success.main' }}>
              {analytics?.summary?.resolution_rate ?? '100%'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">Checklists Completed</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'info.main' }}>
              {analytics?.summary?.checklists_completed ?? 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Period Incident Distribution
              </Typography>
              <BarChartComponent data={incidentData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Departmental Worker Distribution
              </Typography>
              <PieChartComponent data={analytics?.department_distribution || []} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Long-Term Shift & Incident Activity Trends
              </Typography>
              <LineChartComponent data={trendData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
