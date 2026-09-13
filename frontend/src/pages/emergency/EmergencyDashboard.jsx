import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Stack,
  LinearProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, Badge
} from '@mui/material';
import {
  Emergency, Warning, Campaign, GpsFixed, LocalHospital, GroupWork,
  CheckCircle, Speed, VolumeUp, LocalFireDepartment, Air, ReportProblem, Shield
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

export const EmergencyDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    active_sos_alerts: 2,
    acknowledged_alerts: 1,
    dispatched_rescue_teams: 3,
    critical_hazards: 1,
    active_workers_on_site: 48,
    rescue_teams_available: 4,
    gas_status: 'NORMAL',
    ventilation_status: 'OPERATIONAL'
  });
  const [loading, setLoading] = useState(false);
  const [alarmModalOpen, setAlarmModalOpen] = useState(false);
  const [alarmForm, setAlarmForm] = useState({ zone: 'ALL', alarm_type: 'EVACUATION', message: '' });
  const [alertSuccess, setAlertSuccess] = useState('');

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/emergency-officer/dashboard-stats');
      if (res.data) setStats(res.data);
    } catch (err) {
      console.warn('Using default emergency stats');
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBroadcastAlarm = async () => {
    if (!alarmForm.message.trim()) return;
    try {
      await apiClient.post('/emergency-officer/broadcast-alarm', alarmForm);
      setAlertSuccess(`🚨 Emergency Alarm broadcasted to ${alarmForm.zone} zone!`);
      setAlarmModalOpen(false);
      setAlarmForm({ zone: 'ALL', alarm_type: 'EVACUATION', message: '' });
      setTimeout(() => setAlertSuccess(''), 5000);
    } catch (err) {
      alert('Failed to send broadcast alarm');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#0b0f19', minHeight: '100vh', color: '#f8fafc' }}>
      
      {/* Header Banner */}
      <Box sx={{
        p: 3, borderRadius: 3, mb: 3,
        background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #450a0a 100%)',
        boxShadow: '0 8px 32px rgba(220, 38, 38, 0.25)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2
      }}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex' }}>
              <Emergency sx={{ color: '#ffffff', fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="800" sx={{ color: '#ffffff', letterSpacing: '-0.02em' }}>
                Emergency Officer Operations Command
              </Typography>
              <Typography variant="body2" sx={{ color: '#fca5a5' }}>
                Real-time disaster response, worker rescue dispatch, gas alerts & mine-wide evacuation
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="error"
            startIcon={<Campaign />}
            onClick={() => setAlarmModalOpen(true)}
            sx={{ fontWeight: '800', px: 3, py: 1.2, borderRadius: 2.5, boxShadow: '0 4px 14px rgba(220, 38, 38, 0.5)' }}
          >
            TRIGGER MINE ALARM
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/emergency/dispatch')}
            sx={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)', fontWeight: '700', borderRadius: 2.5, '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            Dispatch Squad
          </Button>
        </Stack>
      </Box>

      {alertSuccess && (
        <Alert severity="error" icon={<VolumeUp />} sx={{ mb: 3, fontWeight: 'bold', bgcolor: '#7f1d1d', color: '#ffffff' }}>
          {alertSuccess}
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#1e1b4b', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 3, color: '#ffffff' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="overline" sx={{ color: '#a5b4fc', fontWeight: 'bold' }}>ACTIVE SOS ALERTS</Typography>
                  <Typography variant="h3" fontWeight="800" sx={{ color: '#ef4444' }}>{stats.active_sos_alerts}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.2)' }}>
                  <Emergency sx={{ color: '#ef4444', fontSize: 36 }} />
                </Box>
              </Stack>
              <Button size="small" onClick={() => navigate('/emergency/sos-center')} sx={{ color: '#38bdf8', mt: 1, textTransform: 'none', fontWeight: '700' }}>
                Open SOS Center &rarr;
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#1c1917', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 3, color: '#ffffff' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="overline" sx={{ color: '#fde68a', fontWeight: 'bold' }}>CRITICAL HAZARDS</Typography>
                  <Typography variant="h3" fontWeight="800" sx={{ color: '#f59e0b' }}>{stats.critical_hazards}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.2)' }}>
                  <Warning sx={{ color: '#f59e0b', fontSize: 36 }} />
                </Box>
              </Stack>
              <Button size="small" onClick={() => navigate('/emergency/hazards')} sx={{ color: '#fde68a', mt: 1, textTransform: 'none', fontWeight: '700' }}>
                Review Hazards &rarr;
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#064e3b', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 3, color: '#ffffff' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="overline" sx={{ color: '#6ee7b7', fontWeight: 'bold' }}>RESCUE SQUADS ACTIVE</Typography>
                  <Typography variant="h3" fontWeight="800" sx={{ color: '#10b981' }}>{stats.dispatched_rescue_teams}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.2)' }}>
                  <LocalHospital sx={{ color: '#10b981', fontSize: 36 }} />
                </Box>
              </Stack>
              <Button size="small" onClick={() => navigate('/emergency/dispatch')} sx={{ color: '#6ee7b7', mt: 1, textTransform: 'none', fontWeight: '700' }}>
                Rescue Squad Status &rarr;
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#0f172a', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 3, color: '#ffffff' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="overline" sx={{ color: '#7dd3fc', fontWeight: 'bold' }}>WORKERS IN MINE</Typography>
                  <Typography variant="h3" fontWeight="800" sx={{ color: '#38bdf8' }}>{stats.active_workers_on_site}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(56, 189, 248, 0.2)' }}>
                  <GpsFixed sx={{ color: '#38bdf8', fontSize: 36 }} />
                </Box>
              </Stack>
              <Button size="small" onClick={() => navigate('/emergency/live-map')} sx={{ color: '#7dd3fc', mt: 1, textTransform: 'none', fontWeight: '700' }}>
                View Rescue Map &rarr;
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Section Grid */}
      <Grid container spacing={3}>
        {/* Active Emergency Feed */}
        <Grid item xs={12} md={7}>
          <Card sx={{ bgcolor: '#151c2c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, color: '#ffffff' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Emergency sx={{ color: '#ef4444' }} /> Active Distress Calls & Emergencies
                </Typography>
                <Chip label="LIVE MONITOR" color="error" size="small" sx={{ fontWeight: 'bold' }} />
              </Stack>

              <Stack spacing={2}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.12)', borderLeft: '4px solid #ef4444' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#fca5a5' }}>
                        CRITICAL SOS #1042 — Methane Gas Leak
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                        Worker: John Doe (EMP-004) &bull; Location: Shaft 2, Deep Sector C
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        Timestamp: 2 mins ago &bull; Telemetry CH4: 3.8% (Dangerous)
                      </Typography>
                    </Box>
                    <Button variant="contained" size="small" color="error" onClick={() => navigate('/emergency/sos-center')}>
                      Respond
                    </Button>
                  </Stack>
                </Box>

                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.12)', borderLeft: '4px solid #f59e0b' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#fde68a' }}>
                        HAZARD #809 — Structural Rockfall Warning
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                        Reported in Zone B Access Tunnel &bull; High Severity
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        Timestamp: 12 mins ago &bull; AI Action: Area Evacuation Advised
                      </Typography>
                    </Box>
                    <Button variant="outlined" size="small" sx={{ color: '#fde68a', borderColor: '#f59e0b' }} onClick={() => navigate('/emergency/hazards')}>
                      Details
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Environmental Disaster Monitors */}
        <Grid item xs={12} md={5}>
          <Card sx={{ bgcolor: '#151c2c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, color: '#ffffff' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="700" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Air sx={{ color: '#38bdf8' }} /> Environmental Threat Telemetry
              </Typography>

              <Stack spacing={2.5}>
                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>Methane (CH4) Level</Typography>
                    <Typography variant="body2" fontWeight="bold" color="error.main">1.8% (Warning Threshold: 1.5%)</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={65} color="error" sx={{ height: 8, borderRadius: 2, mt: 1 }} />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>Carbon Monoxide (CO)</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">18 PPM (Normal)</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={22} color="success" sx={{ height: 8, borderRadius: 2, mt: 1 }} />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>Oxygen (O2) Level</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">20.8% (Optimal)</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={95} color="success" sx={{ height: 8, borderRadius: 2, mt: 1 }} />
                </Box>
              </Stack>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<Air />}
                onClick={() => navigate('/emergency/environment')}
                sx={{ mt: 3, color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)', fontWeight: '700' }}
              >
                Open Gas & Environmental Alarms
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Broadcast Alarm Modal */}
      <Dialog open={alarmModalOpen} onClose={() => setAlarmModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#7f1d1d', color: '#ffffff', fontWeight: 'bold' }}>
          🚨 Mine-Wide Emergency Alarm & Evacuation Broadcast
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#0f172a', pt: 3 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: '#94a3b8' }}>Target Mine Zone</InputLabel>
              <Select
                value={alarmForm.zone}
                onChange={(e) => setAlarmForm({ ...alarmForm, zone: e.target.value })}
                label="Target Mine Zone"
                sx={{ color: '#ffffff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
              >
                <MenuItem value="ALL">ALL SECTORS (Mine-Wide Emergency)</MenuItem>
                <MenuItem value="Shaft 1">Shaft 1</MenuItem>
                <MenuItem value="Shaft 2">Shaft 2 - Deep Level</MenuItem>
                <MenuItem value="Zone B">Zone B Access Tunnel</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: '#94a3b8' }}>Alarm Protocol</InputLabel>
              <Select
                value={alarmForm.alarm_type}
                onChange={(e) => setAlarmForm({ ...alarmForm, alarm_type: e.target.value })}
                label="Alarm Protocol"
                sx={{ color: '#ffffff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
              >
                <MenuItem value="EVACUATION">IMMEDIATE EVACUATION SIREN</MenuItem>
                <MenuItem value="SHELTER_IN_PLACE">SHELTER IN REFUGE CHAMBER</MenuItem>
                <MenuItem value="TOXIC_GAS_WARNING">TOXIC GAS HIGH RISK ALARM</MenuItem>
                <MenuItem value="FIRE_ALERT">UNDERGROUND FIRE PROTOCOL</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Broadcast Emergency Message"
              value={alarmForm.message}
              onChange={(e) => setAlarmForm({ ...alarmForm, message: e.target.value })}
              placeholder="E.g., High methane detected in Shaft 2. Proceed immediately to Refuge Chamber B or main exit shaft!"
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#0f172a', p: 2 }}>
          <Button onClick={() => setAlarmModalOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleBroadcastAlarm} sx={{ fontWeight: 'bold' }}>
            BROADCAST EMERGENCY SIREN
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
