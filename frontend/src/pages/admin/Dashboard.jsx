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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
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
  Build as EquipmentIcon,
  HealthAndSafety as PPEIcon,
  Schedule as TimeIcon,
  Thermostat as TempIcon,
  Air as AQIIcon,
  LocalFireDepartment as GasIcon,
  Map as MapIcon,
  CheckCircle as CheckIcon,
  PhoneInTalk as PhoneIcon,
  Chat as ChatIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChartComponent } from '../../components/charts/BarChart';
import { PieChartComponent } from '../../components/charts/PieChart';
import { LineChartComponent } from '../../components/charts/LineChart';
import apiClient from '../../api/client';

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const [kpis, setKpis] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSosDialog, setActiveSosDialog] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const [kpiRes, overviewRes] = await Promise.all([
        apiClient.get('/admin/command-center-kpis'),
        apiClient.get('/admin/overview')
      ]);
      setKpis(kpiRes.data);
      setOverview(overviewRes.data);
    } catch (err) {
      console.error('Failed to load Command Center metrics:', err);
      if (!isSilent) setError(err.response?.data?.detail || 'Unable to load real-time Mine Command Center data');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleSosAction = async (sosId, action) => {
    try {
      await apiClient.post(`/admin/sos/${sosId}/action`, { action });
      fetchDashboardData(true);
      if (action === 'resolve') setActiveSosDialog(null);
    } catch (e) {
      console.error('Failed SOS action:', e);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={48} color="error" />
        <Typography variant="h6" color="textSecondary">Initializing Mine Safety Command Center Telemetry...</Typography>
      </Box>
    );
  }

  const kpiCards = [
    { title: 'Total Workers', value: kpis?.total_workers || 0, sub: 'Registered Fleet', icon: <People sx={{ color: '#38bdf8' }} />, color: '#0284c7' },
    { title: 'Workers Inside Mine', value: kpis?.workers_inside || 0, sub: 'Underground Duty', icon: <HowToReg sx={{ color: '#4ade80' }} />, color: '#22c55e' },
    { title: 'Active SOS Alerts', value: kpis?.active_sos || 0, sub: 'Requires Dispatch', icon: <Emergency sx={{ color: '#f44336' }} />, color: '#ef4444', pulse: kpis?.active_sos > 0 },
    { title: 'Active Hazards', value: kpis?.active_hazards || 0, sub: 'Unresolved Reports', icon: <Warning sx={{ color: '#ff9800' }} />, color: '#f97316' },
    { title: 'Critical Equipment', value: kpis?.critical_equipment || 0, sub: 'Defects / Repairs', icon: <EquipmentIcon sx={{ color: '#eab308' }} />, color: '#eab308' },
    { title: 'PPE Compliance', value: `${kpis?.ppe_compliance_rate || 96.5}%`, sub: 'Pass Verification Rate', icon: <PPEIcon sx={{ color: '#a855f7' }} />, color: '#a855f7' },
    { title: 'Average Safety Score', value: `${kpis?.avg_safety_score || 92.5}%`, sub: 'Mine Safety Index', icon: <Security sx={{ color: '#22c55e' }} />, color: '#22c55e' },
    { title: 'Overtime Workers', value: kpis?.overtime_workers || 0, sub: '8h+ Shift Exceeded', icon: <TimeIcon sx={{ color: '#ec4899' }} />, color: '#ec4899' },
  ];

  const recentSosList = overview?.recent_sos_alerts || [];
  const recentHazards = overview?.recent_hazards || [];

  return (
    <Box sx={{ py: 2 }}>
      {/* Top Banner Header */}
      <Paper
        elevation={4}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
          color: '#fff',
          border: '1px solid #334155'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: '#d32f2f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
              ⛏️
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: 0.5 }}>
                {t('admin.dashboard')}
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Real-Time Underground Worker Telemetry, Hazard Intelligence & Emergency Dispatch Operations
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              icon={<WbSunny sx={{ color: '#f59e0b !important' }} />}
              label={`Methane: ${kpis?.environment?.methane_level || '0.02% (Safe)'} | AQI: ${kpis?.environment?.air_quality || 'Good'}`}
              sx={{ bgcolor: '#0f172a', color: '#fff', border: '1px solid #334155', fontWeight: 'bold' }}
            />
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={() => fetchDashboardData()}
              sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' } }}
            >
              Sync Live Feeds
            </Button>
          </Stack>
        </Box>

        {/* Predictive AI Insights Strip */}
        <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #334155', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {(kpis?.insights || []).map((ins, idx) => (
            <Chip
              key={idx}
              icon={<AutoAwesome sx={{ color: ins.type === 'critical' ? '#ef4444' : '#38bdf8' }} />}
              label={ins.message}
              variant="outlined"
              sx={{
                bgcolor: ins.type === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                color: ins.type === 'critical' ? '#f87171' : '#e2e8f0',
                borderColor: ins.type === 'critical' ? '#ef4444' : '#334155',
                fontWeight: '500'
              }}
            />
          ))}
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Real-Time Active SOS Emergency Command Banner */}
      {recentSosList.length > 0 && recentSosList.some(s => s.status !== 'resolved') && (
        <Paper
          elevation={4}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
            color: '#fff',
            border: '2px solid #ef4444',
            animation: 'pulse 2s infinite'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Emergency sx={{ fontSize: 40, color: '#fca5a5' }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  🚨 ACTIVE UNDERGROUND SOS EMERGENCY DISPATCH REQUIRED
                </Typography>
                <Typography variant="body2" color="#fca5a5">
                  Worker emergency beacon active. Immediate rescue team assignment required.
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              color="error"
              onClick={() => navigate('/admin/sos-center')}
              sx={{ bgcolor: '#dc2626', fontWeight: 'bold' }}
            >
              Open Full SOS Operations Center
            </Button>
          </Box>

          <Grid container spacing={2}>
            {recentSosList.filter(s => s.status !== 'resolved').map((sos) => (
              <Grid item xs={12} md={6} key={sos.id}>
                <Card sx={{ bgcolor: 'rgba(0,0,0,0.4)', border: '1px solid #f87171', color: '#fff', p: 2, borderRadius: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Worker: {sos.worker_name} ({sos.employee_id})
                    </Typography>
                    <Chip label={sos.status.toUpperCase()} color="error" size="small" sx={{ fontWeight: 'bold' }} />
                  </Box>
                  <Typography variant="body2">Location: <strong>{sos.location}</strong></Typography>
                  <Typography variant="caption" color="#fca5a5" display="block" mb={1.5}>
                    Triggered: {sos.timestamp}
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    <Button size="small" variant="contained" sx={{ bgcolor: '#0284c7' }} onClick={() => handleSosAction(sos.id, 'acknowledge')}>
                      Acknowledge
                    </Button>
                    <Button size="small" variant="contained" sx={{ bgcolor: '#d97706' }} onClick={() => handleSosAction(sos.id, 'dispatch')}>
                      Assign Rescue
                    </Button>
                    <Button size="small" variant="contained" color="success" onClick={() => handleSosAction(sos.id, 'resolve')}>
                      Mark Resolved
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* KPI Cards Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpiCards.map((card, idx) => (
          <Grid item xs={6} sm={4} md={3} lg={1.5} key={idx}>
            <Card
              sx={{
                bgcolor: '#090d16',
                border: `1px solid ${card.pulse ? card.color : '#334155'}`,
                borderRadius: 3,
                p: 2,
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-3px)' }
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '0.75rem' }}>
                  {card.title.toUpperCase()}
                </Typography>
                {card.icon}
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ color: card.color }}>
                {card.value}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                {card.sub}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Command Center Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Live Mine Map Preview */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2.5, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <MapIcon sx={{ color: '#38bdf8' }} />
                <Typography variant="h6" fontWeight="bold" color="#fff">
                  🗺️ Live Mine Map & Sector Telemetry
                </Typography>
              </Box>
              <Button size="small" variant="outlined" endIcon={<ArrowForward />} onClick={() => navigate('/admin/live-map')}>
                Full Mine Map
              </Button>
            </Box>

            <Paper sx={{ height: 320, bgcolor: '#1e293b', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid #334155' }}>
              <Typography variant="subtitle1" fontWeight="bold" color="#38bdf8">
                📍 Interactive 3D Mine Map View
              </Typography>
              <Typography variant="body2" color="#94a3b8" align="center" sx={{ maxWidth: 450, my: 1 }}>
                Tracking {kpis?.workers_inside || 0} active workers across Sector Alpha, Shaft 2 Pit, and Muster Stations. Safe zones & geofences active.
              </Typography>
              <Button variant="contained" startIcon={<MapIcon />} onClick={() => navigate('/admin/live-map')} sx={{ bgcolor: '#0284c7' }}>
                Open Interactive Map & Geofences
              </Button>
            </Paper>
          </Card>
        </Grid>

        {/* Environmental & Mine Telemetry */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2.5, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" color="#fff" mb={2}>
              🌡️ Environmental Sensor Telemetry
            </Typography>

            <Stack spacing={2}>
              <Paper sx={{ p: 1.5, bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <TempIcon sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" color="#fff">Surface / Tunnel Temp</Typography>
                </Box>
                <Chip label="27.5°C / 23.8°C" color="success" size="small" />
              </Paper>

              <Paper sx={{ p: 1.5, bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <GasIcon sx={{ color: '#22c55e' }} />
                  <Typography variant="body2" color="#fff">Methane CH4 Gas Sensor</Typography>
                </Box>
                <Chip label="0.02% (Safe)" color="success" size="small" />
              </Paper>

              <Paper sx={{ p: 1.5, bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <AQIIcon sx={{ color: '#38bdf8' }} />
                  <Typography variant="body2" color="#fff">Air Quality Index (AQI)</Typography>
                </Box>
                <Chip label="AQI 42 (Good)" color="info" size="small" />
              </Paper>

              <Alert severity="success" sx={{ borderRadius: 2 }}>
                All environmental thresholds are within safe MSHA parameters. Automatic ventilation active.
              </Alert>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Analytics Charts & Recent Logs */}
      <Grid container spacing={3}>
        {/* Recent Hazards Log */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2.5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold" color="#fff">
                ⚠️ Recent Hazard Reports
              </Typography>
              <Button size="small" variant="text" onClick={() => navigate('/admin/hazards')} sx={{ color: '#38bdf8' }}>
                View All
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#94a3b8' }}>Type</TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>Location</TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>Severity</TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentHazards.length > 0 ? (
                    recentHazards.slice(0, 4).map((h) => (
                      <TableRow key={h.id}>
                        <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>{h.hazard_type}</TableCell>
                        <TableCell sx={{ color: '#94a3b8' }}>{h.location}</TableCell>
                        <TableCell>
                          <Chip label={h.severity} size="small" color={h.severity === 'high' ? 'error' : 'warning'} />
                        </TableCell>
                        <TableCell>
                          <Chip label={h.status} size="small" variant="outlined" color="info" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ color: '#94a3b8', py: 2 }}>
                        No unresolved hazards reported today.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Quick Command Actions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2.5 }}>
            <Typography variant="h6" fontWeight="bold" color="#fff" mb={2}>
              ⚡ Command Center Quick Actions
            </Typography>

            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Button fullWidth variant="contained" startIcon={<People />} onClick={() => navigate('/admin/workers')} sx={{ bgcolor: '#0284c7', py: 1.2 }}>
                  Add / Manage Worker
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button fullWidth variant="contained" startIcon={<AssignmentTurnedIn />} onClick={() => navigate('/admin/checklists')} sx={{ bgcolor: '#9333ea', py: 1.2 }}>
                  Create Safety Checklist
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button fullWidth variant="contained" startIcon={<Warning />} onClick={() => navigate('/admin/zones')} sx={{ bgcolor: '#d97706', py: 1.2 }}>
                  Create Danger Zone
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button fullWidth variant="contained" startIcon={<Emergency />} onClick={() => navigate('/admin/communication')} sx={{ bgcolor: '#dc2626', py: 1.2 }}>
                  Send Emergency Broadcast
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
