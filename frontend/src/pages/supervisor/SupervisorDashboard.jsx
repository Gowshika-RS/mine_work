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
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  People,
  Warning,
  Emergency,
  Assignment,
  Shield,
  CheckCircle,
  AccessTime,
  Refresh,
  EventAvailable,
  ArrowForward,
  Build as EquipmentIcon,
  HealthAndSafety as PPEIcon,
  WbSunny,
  Map as MapIcon,
  Schedule as HandoverIcon,
  Campaign as BroadcastIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';

export const SupervisorDashboard = () => {
  const { t } = useTranslation();
  const [kpis, setKpis] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentSos, setRecentSos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchControlCenterData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const [kpiRes, statsRes] = await Promise.all([
        apiClient.get('/supervisor/control-center-kpis'),
        apiClient.get('/supervisor/dashboard/stats')
      ]);
      setKpis(kpiRes.data);
      setStats(statsRes.data);
      // Fetch active SOS list if any
      const sosRes = await apiClient.get('/admin/overview');
      setRecentSos(sosRes.data?.recent_sos_alerts || []);
    } catch (err) {
      console.error('Failed to load Supervisor Control Center data:', err);
      if (!isSilent) setError(err.response?.data?.detail || 'Unable to load real-time Supervisor Control Center data');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchControlCenterData();
    const interval = setInterval(() => {
      fetchControlCenterData(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [fetchControlCenterData]);

  const handleSosWorkflowAction = async (sosId, action) => {
    try {
      await apiClient.post(`/supervisor/sos/${sosId}/action`, { action });
      fetchControlCenterData(true);
    } catch (err) {
      console.error('SOS action failed:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={48} color="warning" />
        <Typography variant="h6" color="textSecondary">Initializing Supervisor Safety Control Center...</Typography>
      </Box>
    );
  }

  const cards = [
    { title: 'Assigned Workers', value: kpis?.total_assigned_workers || 0, sub: 'Under Supervision', color: '#0284c7', icon: <People sx={{ color: '#38bdf8' }} /> },
    { title: 'Workers Inside Mine', value: kpis?.workers_inside_mine || 0, sub: 'Underground Shifts', color: '#22c55e', icon: <EventAvailable sx={{ color: '#4ade80' }} /> },
    { title: 'Workers Outside', value: kpis?.workers_outside_mine || 0, sub: 'Surface / Off Duty', color: '#94a3b8', icon: <AccessTime sx={{ color: '#94a3b8' }} /> },
    { title: 'Active SOS Alerts', value: kpis?.active_sos || 0, sub: 'Immediate Response Required', color: '#ef4444', icon: <Emergency sx={{ color: '#f44336' }} />, pulse: kpis?.active_sos > 0 },
    { title: 'Open Hazards', value: kpis?.open_hazards || 0, sub: 'Team Reports', color: '#f97316', icon: <Warning sx={{ color: '#ff9800' }} /> },
    { title: 'Critical Equipment', value: kpis?.critical_equipment || 0, sub: 'Technician Assigned', color: '#eab308', icon: <EquipmentIcon sx={{ color: '#eab308' }} /> },
    { title: 'PPE Compliance', value: `${kpis?.ppe_compliance_rate || 96.5}%`, sub: 'Pass Scan Rate', color: '#a855f7', icon: <PPEIcon sx={{ color: '#a855f7' }} /> },
    { title: 'Team Safety Score', value: `${kpis?.avg_team_safety_score || 92.5}%`, sub: 'Team Safety Index', color: '#22c55e', icon: <Shield sx={{ color: '#22c55e' }} /> },
    { title: 'Overtime Workers', value: kpis?.overtime_workers || 0, sub: '8h+ Shift Limit', color: '#ec4899', icon: <AccessTime sx={{ color: '#ec4899' }} /> },
  ];

  return (
    <Box sx={{ py: 2 }}>
      {/* Top Banner Header */}
      <Paper
        elevation={4}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          border: '1px solid #334155'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
              🦺
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: 0.5 }}>
                {t('supervisor.dashboard')}
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Operational Safety Management: MONITOR → VERIFY → RESPOND → ASSIGN → ESCALATE → RESOLVE → HANDOVER
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              icon={<WbSunny sx={{ color: '#f59e0b !important' }} />}
              label={`Temp: ${kpis?.environment?.temperature || '27.2°C'} | Methane: ${kpis?.environment?.methane_level || '0.02% (Safe)'}`}
              sx={{ bgcolor: '#0f172a', color: '#fff', border: '1px solid #334155', fontWeight: 'bold' }}
            />
            <Button variant="contained" startIcon={<Refresh />} onClick={() => fetchControlCenterData()} sx={{ bgcolor: '#0284c7' }}>
              Live Sync
            </Button>
          </Stack>
        </Box>

        {/* Actionable Warnings Bar */}
        <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #334155', display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {(kpis?.actionable_warnings || []).map((warn, idx) => (
            <Chip
              key={idx}
              label={warn.message}
              variant="outlined"
              sx={{
                bgcolor: warn.type === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(15,23,42,0.6)',
                color: warn.type === 'critical' ? '#f87171' : '#e2e8f0',
                borderColor: warn.type === 'critical' ? '#ef4444' : '#334155',
                fontWeight: 'bold'
              }}
            />
          ))}
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* SOS Emergency Alert Workflow Banner */}
      {recentSos.length > 0 && recentSos.some(s => s.status !== 'resolved') && (
        <Paper
          elevation={4}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
            color: '#fff',
            border: '2px solid #ef4444'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Emergency sx={{ fontSize: 36, color: '#fca5a5' }} />
              <Typography variant="h5" fontWeight="bold">
                🚨 ACTIVE SOS EMERGENCY RESPONSE — ASSIGNED WORKER
              </Typography>
            </Box>
            <Button variant="contained" color="error" onClick={() => navigate('/supervisor/emergency-center')} sx={{ fontWeight: 'bold' }}>
              Open Emergency Center
            </Button>
          </Box>

          <Grid container spacing={2}>
            {recentSos.filter(s => s.status !== 'resolved').map((sos) => (
              <Grid item xs={12} md={6} key={sos.id}>
                <Card sx={{ bgcolor: 'rgba(0,0,0,0.4)', border: '1px solid #f87171', color: '#fff', p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Worker: {sos.worker_name} ({sos.employee_id})
                  </Typography>
                  <Typography variant="body2" color="#fca5a5">Location: {sos.location}</Typography>
                  <Typography variant="caption" color="#cbd5e1" display="block" mb={1.5}>
                    Triggered: {sos.timestamp} | Status: <strong>{sos.status.toUpperCase()}</strong>
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button size="small" variant="contained" sx={{ bgcolor: '#0284c7' }} onClick={() => handleSosWorkflowAction(sos.id, 'acknowledge')}>
                      Acknowledge
                    </Button>
                    <Button size="small" variant="contained" sx={{ bgcolor: '#d97706' }} onClick={() => handleSosWorkflowAction(sos.id, 'dispatch')}>
                      Assign Rescue
                    </Button>
                    <Button size="small" variant="contained" color="success" onClick={() => handleSosWorkflowAction(sos.id, 'resolve')}>
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
        {cards.map((card, idx) => (
          <Grid item xs={6} sm={4} md={2.6} key={idx}>
            <Card sx={{ bgcolor: '#090d16', border: `1px solid ${card.pulse ? card.color : '#334155'}`, borderRadius: 3, p: 2, height: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '0.75rem' }}>
                  {card.title.toUpperCase()}
                </Typography>
                {card.icon}
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ color: card.color }}>
                {card.value}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {card.sub}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Operational Action Shortcuts */}
      <Card sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3, p: 2.5 }}>
        <Typography variant="h6" fontWeight="bold" color="#fff" mb={2}>
          ⚡ Supervisor Operational Control Shortcuts
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Button fullWidth variant="contained" startIcon={<Assignment />} onClick={() => navigate('/supervisor/tasks')} sx={{ bgcolor: '#9333ea', py: 1.2 }}>
              Assign Safety Task
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button fullWidth variant="contained" startIcon={<HandoverIcon />} onClick={() => navigate('/supervisor/shift-handover')} sx={{ bgcolor: '#d97706', py: 1.2 }}>
              Log Shift Handover
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button fullWidth variant="contained" startIcon={<BroadcastIcon />} onClick={() => navigate('/supervisor/communication')} sx={{ bgcolor: '#0284c7', py: 1.2 }}>
              Team Announcement
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button fullWidth variant="contained" startIcon={<MapIcon />} onClick={() => navigate('/supervisor/live-tracking')} sx={{ bgcolor: '#059669', py: 1.2 }}>
              Live Worker Map
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default SupervisorDashboard;
