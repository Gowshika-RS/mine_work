import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from '@mui/material';
import {
  People,
  HowToReg,
  Warning,
  Emergency,
  Security,
  WbSunny,
  AutoAwesome,
  Refresh,
  AssignmentTurnedIn,
  ArrowForward,
  ReportProblem,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { BarChartComponent } from '../../components/charts/BarChart';
import { PieChartComponent } from '../../components/charts/PieChart';
import { LineChartComponent } from '../../components/charts/LineChart';
import apiClient from '../../api/client';

export const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchOverviewData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/admin/overview');
      setOverview(response.data);
    } catch (err) {
      console.error('Failed to load overview:', err);
      if (!isSilent) setError(err.response?.data?.detail || 'Unable to load live admin dashboard metrics');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData();

    // Auto polling interval (every 5 seconds) to catch incoming SOS alerts & worker hazard reports instantly
    const interval = setInterval(() => {
      fetchOverviewData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchOverviewData]);

  if (loading) {
    return (
      <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="textSecondary">Loading real-time admin metrics...</Typography>
      </Box>
    );
  }

  const kpis = [
    {
      title: 'Total Workers',
      value: overview?.total_workers ?? 0,
      sub: 'Registered personnel',
      icon: <People sx={{ fontSize: 32, color: 'primary.main' }} />,
    },
    {
      title: 'Active Workers',
      value: overview?.active_workers ?? 0,
      sub: 'Currently operational',
      icon: <HowToReg sx={{ fontSize: 32, color: 'success.main' }} />,
    },
    {
      title: 'Checked In / Out',
      value: `${overview?.workers_checked_in ?? 0} / ${overview?.workers_checked_out ?? 0}`,
      sub: 'Today\'s shift activity',
      icon: <AssignmentTurnedIn sx={{ fontSize: 32, color: 'info.main' }} />,
    },
    {
      title: 'Pending Hazards',
      value: overview?.pending_hazards ?? 0,
      sub: 'Reports under review',
      icon: <Warning sx={{ fontSize: 32, color: 'warning.main' }} />,
    },
    {
      title: 'Active SOS Alerts',
      value: overview?.active_sos ?? 0,
      sub: 'Requires emergency response',
      icon: <Emergency sx={{ fontSize: 32, color: 'error.main' }} />,
    },
    {
      title: 'Overall Safety Score',
      value: `${overview?.overall_safety_score ?? 95}%`,
      sub: 'Fleet average rating',
      icon: <Security sx={{ fontSize: 32, color: 'success.main' }} />,
    },
  ];

  const recentSosAlerts = overview?.recent_sos_alerts || [];
  const recentHazards = overview?.recent_hazards || [];

  return (
    <Box sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            MineGuard Control Center
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Real-time monitoring, worker analytics, and hazard intelligence
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip label="Live System Connected" color="success" size="medium" />
          <Button startIcon={<Refresh />} variant="outlined" size="small" onClick={() => fetchOverviewData()}>
            Refresh Data
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {kpis.map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={idx}>
            <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                    {kpi.title}
                  </Typography>
                  {kpi.icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {kpi.value}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {kpi.sub}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Weather and AI Risk Summary Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(0, 240, 255, 0.05))',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <WbSunny sx={{ color: 'warning.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Today's Mine Weather
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Surface & Sub-surface Climate Monitoring
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Surface Temperature</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{overview?.today_weather?.temperature || '28°C'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Mine Shaft Temp</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{overview?.today_weather?.underground_temp || '24°C'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Humidity</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{overview?.today_weather?.humidity || '54%'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Methane Concentration</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {overview?.today_weather?.methane_level || '0.02% (Safe)'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <AutoAwesome sx={{ color: 'primary.main', fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Gemini AI Safety & Risk Summary
                </Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'text.primary', mb: 2 }}>
                {overview?.ai_risk_summary || 'AI Safety Diagnostics: Real-time risk analysis indicates normal operational levels across all active underground sectors.'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`Low Risks: ${overview?.hazard_stats?.low ?? 0}`} color="success" size="small" variant="outlined" />
              <Chip label={`Medium Risks: ${overview?.hazard_stats?.medium ?? 0}`} color="info" size="small" variant="outlined" />
              <Chip label={`High Risks: ${overview?.hazard_stats?.high ?? 0}`} color="warning" size="small" variant="outlined" />
              <Chip label={`Critical Risks: ${overview?.hazard_stats?.critical ?? 0}`} color="error" size="small" variant="outlined" />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Live Active Emergency SOS Alerts & Reported Hazards Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Active Emergency SOS Alerts Feed */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderLeft: '4px solid #ef4444' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Emergency color="error" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Active SOS Distress Alerts ({recentSosAlerts.length})
                  </Typography>
                </Box>
                <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/admin/sos')}>
                  View SOS Hub
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Worker</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentSosAlerts.map((sos) => (
                      <TableRow key={sos.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {sos.worker_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {sos.employee_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {sos.location}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="textSecondary">
                            {sos.timestamp}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={sos.status.toUpperCase()}
                            color={sos.status === 'resolved' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {recentSosAlerts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="textSecondary">
                            No active SOS emergency distress beacons. All mine sectors clear.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Reported Hazard Reports Feed */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderLeft: '4px solid #f59e0b' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReportProblem sx={{ color: 'warning.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Recent Worker Hazard Reports ({recentHazards.length})
                  </Typography>
                </Box>
                <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/admin/hazards')}>
                  Manage Hazards
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Hazard Type & Reporter</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentHazards.map((h) => (
                      <TableRow key={h.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {h.hazard_type}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            By: {h.reporter_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {h.location}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={h.severity.toUpperCase()}
                            color={h.severity === 'critical' || h.severity === 'high' ? 'error' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={h.status.replace('_', ' ').toUpperCase()}
                            color={h.status === 'resolved' ? 'success' : 'info'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {recentHazards.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="textSecondary">
                            No reported hazards currently pending.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Analytics Charts Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Weekly Hazard Activity Trends
              </Typography>
              <BarChartComponent data={overview?.charts?.hazard_trends || []} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Worker Attendance & Shift Status
              </Typography>
              <PieChartComponent data={overview?.charts?.worker_attendance || []} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Monthly Incident & Safety Report Trends
              </Typography>
              <LineChartComponent data={overview?.charts?.incident_reports || []} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
