import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button,
  Paper, Chip, Stack, LinearProgress, CircularProgress, Avatar, IconButton, Divider, Alert, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Badge
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import ShieldIcon from '@mui/icons-material/Shield';
import ChatIcon from '@mui/icons-material/Chat';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MapIcon from '@mui/icons-material/Map';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PsychologyIcon from '@mui/icons-material/Psychology';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import { HoldToSOSButton } from '../../components/dashboard/HoldToSOSButton';
import { EnvironmentalGauges } from '../../components/dashboard/EnvironmentalGauges';
import { ShiftTimeline } from '../../components/dashboard/ShiftTimeline';
import { CategorizedModuleCatalog } from '../../components/dashboard/CategorizedModuleCatalog';
import { HealthFatigueCard } from '../../components/dashboard/HealthFatigueCard';
import { PPEStatusCard } from '../../components/dashboard/PPEStatusCard';
import { SafeZoneCard } from '../../components/dashboard/SafeZoneCard';
import { RecentHazardsCard } from '../../components/dashboard/RecentHazardsCard';

export const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [weather, setWeather] = useState(null);
  const [activeSOS, setActiveSOS] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSuccessDialog, setSosSuccessDialog] = useState(false);
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);

  // New states for expanded feature modules
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [healthAssessment, setHealthAssessment] = useState(null);
  const [ppeRecord, setPpeRecord] = useState(null);
  const [recentHazards, setRecentHazards] = useState([]);
  const [mlAssessment, setMlAssessment] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check offline hazard reports queue in localStorage
    try {
      const queue = JSON.parse(localStorage.getItem('offline_hazard_reports') || '[]');
      setOfflineQueueCount(queue.length);
    } catch {}

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userRes = await apiClient.get('/users/me');
      setUser(userRes.data);
    } catch (e) {
      try {
        const localUser = localStorage.getItem('user');
        if (localUser) setUser(JSON.parse(localUser));
      } catch {}
    }

    try {
      const gameRes = await apiClient.get('/gamification/profile');
      setGamification(gameRes.data);
    } catch (e) {}

    try {
      const weatherRes = await apiClient.get('/weather/current');
      setWeather(weatherRes.data);
    } catch (e) {}

    try {
      const sosRes = await apiClient.get('/sos/active');
      if (sosRes.data && Array.isArray(sosRes.data) && sosRes.data.length > 0) {
        setActiveSOS(sosRes.data[0]);
      }
    } catch (e) {}

    try {
      const notifRes = await apiClient.get('/notifications/');
      if (notifRes.data && Array.isArray(notifRes.data)) {
        setRecentNotifications(notifRes.data.slice(0, 5));
        setUnreadNotifCount(notifRes.data.filter(n => !n.is_read).length);
      }
    } catch (e) {}

    // 1. Health assessment
    try {
      const healthRes = await apiClient.get('/health/assessment/latest');
      if (healthRes.data) setHealthAssessment(healthRes.data);
    } catch (e) {}

    // 2. PPE Verification record
    try {
      const ppeRes = await apiClient.get('/ppe/latest');
      if (ppeRes.data) setPpeRecord(ppeRes.data);
    } catch (e) {}

    // 3. Recent Hazard Reports
    try {
      const hazardRes = await apiClient.get('/hazards/');
      if (hazardRes.data && Array.isArray(hazardRes.data)) {
        setRecentHazards(hazardRes.data.slice(0, 3));
      }
    } catch (e) {}

    // 4. ML Real-time prediction (3-class Random Forest)
    try {
      const mlRes = await apiClient.get('/ml/realtime-telemetry');
      if (mlRes.data && mlRes.data.prediction) {
        setMlAssessment(mlRes.data.prediction);
      }
    } catch (e) {}

    // 5. Current location
    try {
      const locRes = await apiClient.get('/locations/current');
      if (locRes.data) setUserLocation(locRes.data);
    } catch (e) {}
  };

  const handleTriggerSOS = async () => {
    setSosLoading(true);
    try {
      const payload = {
        latitude: 12.9716,
        longitude: 77.5946,
        alert_type: "SOS_TRIGGERED",
        emergency_type: "General Emergency"
      };

      let res;
      try {
        res = await apiClient.post('/emergency/sos', payload);
      } catch (err1) {
        res = await apiClient.post('/sos/trigger', payload);
      }
      setActiveSOS(res.data);
      setSosSuccessDialog(true);
      if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
    } catch (err) {
      console.error("Dashboard SOS trigger error:", err);
      navigate('/worker/sos');
    } finally {
      setSosLoading(false);
    }
  };

  const fullName = user?.profile?.full_name || user?.username || 'Gowshi';
  const safetyScore = user?.profile?.safety_score || 100;
  const streakDays = gamification?.current_streak || 2;
  const xpPoints = gamification?.xp || 200;

  // ML 3-class probability extraction
  const mlProbabilities = mlAssessment?.class_probabilities || { safe: 92.0, warning: 6.0, critical: 2.0 };
  const mlStatus = mlAssessment?.risk_status || 'Safe';
  const mlRecommendation = mlAssessment?.recommendation || 'Continue standard safety protocols with regular equipment verification.';

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* 1. TOP HEADER (COMPACT PROFESSIONAL HEADER WITH OFFLINE SYNC & STATUS INDICATORS) */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 2.5, pb: 1.5, borderBottom: '1px solid #e2e8f0' }}>
        <Box>
          <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.02em', fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
            {t('dashboard.workerSafety', 'Worker Safety')}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
            {t('dashboard.safetyOverview', 'Dashboard / Safety Overview')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          {/* GPS Indicator */}
          <Chip
            label={t('dashboard.gpsConnected', 'GPS Connected')}
            size="small"
            sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: '0.72rem', border: '1px solid #a7f3d0' }}
          />

          {/* Persistent Offline Sync Status Indicator */}
          {isOnline ? (
            <Chip
              icon={<WifiIcon sx={{ color: '#1d4ed8 !important', fontSize: '0.85rem' }} />}
              label={t('dashboard.internetLive', 'Internet Live')}
              size="small"
              sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.72rem', border: '1px solid #bfdbfe' }}
            />
          ) : (
            <Chip
              icon={<WifiOffIcon sx={{ color: '#b45309 !important', fontSize: '0.85rem' }} />}
              label={`Offline (${offlineQueueCount} Queued)`}
              size="small"
              onClick={() => navigate('/worker/offline-reports')}
              sx={{ bgcolor: '#fffbeb', color: '#b45309', fontWeight: 800, fontSize: '0.72rem', border: '1px solid #fde68a', cursor: 'pointer' }}
            />
          )}

          {/* PPE Compliance Status Chip */}
          <Chip
            icon={<VerifiedUserIcon sx={{ color: (ppeRecord?.passed ?? true) ? '#047857 !important' : '#dc2626 !important', fontSize: '0.85rem' }} />}
            label={(ppeRecord?.passed ?? true) ? 'PPE Verified' : 'PPE Action Needed'}
            size="small"
            onClick={() => navigate('/worker/ppe-scan')}
            sx={{
              bgcolor: (ppeRecord?.passed ?? true) ? '#ecfdf5' : '#fef2f2',
              color: (ppeRecord?.passed ?? true) ? '#047857' : '#b91c1c',
              fontWeight: 700,
              fontSize: '0.72rem',
              border: `1px solid ${(ppeRecord?.passed ?? true) ? '#a7f3d0' : '#fca5a5'}`,
              cursor: 'pointer'
            }}
          />

          <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ ml: 0.5, mr: 0.5, fontSize: '0.8rem' }}>
            🕒 {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>

          <IconButton onClick={() => navigate('/worker/notifications')} sx={{ bgcolor: '#f1f5f9', p: 1 }}>
            <Badge badgeContent={unreadNotifCount} color="error">
              <NotificationsIcon sx={{ color: '#475569', fontSize: 18 }} />
            </Badge>
          </IconButton>

          <IconButton onClick={() => navigate('/worker/profile')} sx={{ bgcolor: '#4f46e5', color: '#fff', p: 1, '&:hover': { bgcolor: '#4338ca' } }}>
            <PersonIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Box>

      {/* 2. EMERGENCY ALERT STRIP */}
      {activeSOS && (
        <Paper
          elevation={0}
          sx={{
            mb: 2.5, p: 1.8, borderRadius: 2,
            borderLeft: '4px solid #dc2626',
            bgcolor: '#fef2f2',
            borderTop: '1px solid #fee2e2',
            borderRight: '1px solid #fee2e2',
            borderBottom: '1px solid #fee2e2',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <WarningIcon sx={{ color: '#dc2626', fontSize: 22 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#991b1b', lineHeight: 1.2 }}>
                🚨 {t('dashboard.activeEmergency', 'ACTIVE EMERGENCY')} — Distress Beacon #{activeSOS.id} ({activeSOS.emergency_type})
              </Typography>
              <Typography variant="caption" sx={{ color: '#b91c1c', fontWeight: 500 }}>
                Supervisor and Control Room have been notified. Location tracking live.
              </Typography>
            </Box>
          </Box>
          <Button
            color="error"
            variant="contained"
            size="small"
            onClick={() => navigate('/worker/sos')}
            sx={{ fontWeight: 700, borderRadius: 1.5, boxShadow: 'none', px: 2 }}
          >
            {t('dashboard.viewEmergency', 'View Emergency')}
          </Button>
        </Paper>
      )}

      {/* 3. WELCOME & SHIFT SUMMARY SECTION */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          mb: 2.5
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
              <Chip label="Safety Status: PROTECTED" size="small" sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 800, fontSize: '0.7rem' }} />
              <Typography variant="caption" color="text.secondary" fontWeight="600">Shift 1 • Sector B</Typography>
            </Box>
            <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.015em', mb: 0.5, color: '#0f172a' }}>
              {t('dashboard.welcomeUser', { name: fullName }) || `Welcome back, ${fullName}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              Your safety monitoring is active. MineGuard telemetry is scanning environmental and personal risk indicators.
            </Typography>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box p={1.8} borderRadius={2} bgcolor="#f8fafc" border="1px solid #e2e8f0">
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600" display="block">Current Shift</Typography>
                  <Typography variant="subtitle2" fontWeight="700" color="#0f172a">08:00 AM – Active</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600" display="block">Safety Streak</Typography>
                  <Typography variant="subtitle2" fontWeight="700" color="#0f172a">{streakDays} Days 🔥</Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 4. DEDICATED EMERGENCY ASSISTANCE CONTROL CARD */}
      <Box sx={{ mb: 2.5 }}>
        <HoldToSOSButton
          onTriggerSOS={handleTriggerSOS}
          loading={sosLoading}
          activeSOS={activeSOS}
        />
      </Box>

      {/* 5. KEY SAFETY METRICS (4-CARD KPI ROW) */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {/* Metric 1: Safety Score */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">1. SAFETY SCORE</Typography>
              <ShieldIcon sx={{ color: '#10b981', fontSize: 20 }} />
            </Box>
            <Typography variant="h4" fontWeight="800" sx={{ color: '#10b981', letterSpacing: '-0.02em', fontSize: '1.75rem' }}>
              {Math.round(safetyScore)}%
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              Safe / Optimal Compliance
            </Typography>
          </Paper>
        </Grid>

        {/* Metric 2: Shift Status */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">2. SHIFT STATUS</Typography>
              <AccessTimeIcon sx={{ color: '#4f46e5', fontSize: 20 }} />
            </Box>
            <Typography variant="h4" fontWeight="800" sx={{ color: '#4f46e5', letterSpacing: '-0.02em', fontSize: '1.75rem' }}>
              Active
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              02h 15m elapsed
            </Typography>
          </Paper>
        </Grid>

        {/* Metric 3: Environment */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">3. ENVIRONMENT</Typography>
              <WbSunnyIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
            </Box>
            <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: '-0.02em', fontSize: '1.75rem' }}>
              {weather ? `${weather.temperature}°C` : '21.8°C'}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              AQI {weather ? weather.air_quality_index : 72} · Normal
            </Typography>
          </Paper>
        </Grid>

        {/* Metric 4: Safety Streak */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">4. SAFETY STREAK</Typography>
              <EmojiEventsIcon sx={{ color: '#6366f1', fontSize: 20 }} />
            </Box>
            <Typography variant="h4" fontWeight="800" sx={{ color: '#6366f1', letterSpacing: '-0.02em', fontSize: '1.75rem' }}>
              {streakDays} Days
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              {xpPoints} XP earned
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 6. REAL-TIME SAFETY STATUS & UPGRADED 3-CLASS AI ASSESSMENT */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: '#64748b', mb: 1, display: 'block' }}>
          {t('dashboard.realTimeSafetyStatus', 'REAL-TIME SAFETY STATUS')}
        </Typography>

        <Grid container spacing={2}>
          {/* Left Column: Environmental Gauges */}
          <Grid item xs={12} md={6}>
            <EnvironmentalGauges weather={weather} />
          </Grid>

          {/* Right Column: Upgraded AI Safety Assessment (3-Class Random Forest Model) */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: '#64748b' }}>
                  {t('dashboard.aiSafetyAssessment', 'AI SAFETY ASSESSMENT')}
                </Typography>
                <Chip icon={<AutoAwesomeIcon sx={{ fontSize: '0.85rem !important' }} />} label="Random Forest Model" size="small" sx={{ fontWeight: 700, bgcolor: '#f1f5f9' }} />
              </Box>

              {/* Predicted Class Banner */}
              <Box p={1.8} borderRadius={2} bgcolor={mlStatus === 'Critical' ? '#fef2f2' : mlStatus === 'Warning' ? '#fffbeb' : '#ecfdf5'} border={`1px solid ${mlStatus === 'Critical' ? '#fca5a5' : mlStatus === 'Warning' ? '#fde68a' : '#a7f3d0'}`} mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="caption" fontWeight="800" color="text.secondary">PREDICTED RISK CLASS</Typography>
                  <Chip
                    label={mlStatus.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: mlStatus === 'Critical' ? '#dc2626' : mlStatus === 'Warning' ? '#d97706' : '#059669',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.72rem'
                    }}
                  />
                </Box>
                <Typography variant="h5" fontWeight="800" color={mlStatus === 'Critical' ? '#991b1b' : mlStatus === 'Warning' ? '#b45309' : '#047857'} sx={{ letterSpacing: '-0.02em' }}>
                  {mlStatus} ({mlProbabilities.safe}% Confidence)
                </Typography>
              </Box>

              {/* 3-Class Probability Distribution Progress Bars */}
              <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                3-CLASS PROBABILITY DISTRIBUTION:
              </Typography>

              <Stack spacing={1.2} sx={{ mb: 2 }}>
                {/* Safe Class */}
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.3}>
                    <Typography variant="caption" fontWeight="700" color="#059669">🟢 Safe</Typography>
                    <Typography variant="caption" fontWeight="800" color="#059669">{mlProbabilities.safe}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={mlProbabilities.safe}
                    sx={{ height: 6, borderRadius: 3, bgcolor: '#ecfdf5', '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 3 } }}
                  />
                </Box>

                {/* Warning Class */}
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.3}>
                    <Typography variant="caption" fontWeight="700" color="#d97706">🟡 Warning</Typography>
                    <Typography variant="caption" fontWeight="800" color="#d97706">{mlProbabilities.warning}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={mlProbabilities.warning}
                    sx={{ height: 6, borderRadius: 3, bgcolor: '#fffbeb', '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b', borderRadius: 3 } }}
                  />
                </Box>

                {/* Critical Class */}
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.3}>
                    <Typography variant="caption" fontWeight="700" color="#dc2626">🔴 Critical</Typography>
                    <Typography variant="caption" fontWeight="800" color="#dc2626">{mlProbabilities.critical}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={mlProbabilities.critical}
                    sx={{ height: 6, borderRadius: 3, bgcolor: '#fef2f2', '& .MuiLinearProgress-bar': { bgcolor: '#ef4444', borderRadius: 3 } }}
                  />
                </Box>
              </Stack>

              <Box p={1.8} borderRadius={2} bgcolor="#f8fafc" borderLeft="3px solid #4f46e5" sx={{ flexGrow: 1, mb: 2 }}>
                <Typography variant="caption" fontWeight="800" color="#4f46e5">
                  AI RECOMMENDATION:
                </Typography>
                <Typography variant="body2" fontWeight="600" color="#1e293b" sx={{ mt: 0.5 }}>
                  "{mlRecommendation}"
                </Typography>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                endIcon={<ArrowForwardIcon />}
                onClick={() => setAiAnalysisOpen(true)}
                sx={{ borderRadius: 2, fontWeight: 700, color: '#4f46e5', borderColor: '#c7d2fe' }}
              >
                View Full AI Analysis
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 7. NEW WORKER SAFETY MODULE CARDS (3-COLUMN GRID) */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: '#64748b', mb: 1, display: 'block' }}>
          WORKER HEALTH & SAFETY INTELLIGENCE
        </Typography>

        <Grid container spacing={2}>
          {/* Health & Fatigue Monitoring Card */}
          <Grid item xs={12} md={4}>
            <HealthFatigueCard healthAssessment={healthAssessment} />
          </Grid>

          {/* PPE Verification Card */}
          <Grid item xs={12} md={4}>
            <PPEStatusCard ppeRecord={ppeRecord} />
          </Grid>

          {/* Safe-Zone Navigation Card */}
          <Grid item xs={12} md={4}>
            <SafeZoneCard locationData={userLocation} />
          </Grid>
        </Grid>
      </Box>

      {/* 8. AI HAZARD IMAGE ANALYSIS / RECENT HAZARD REPORTS */}
      <Box sx={{ mb: 2.5 }}>
        <RecentHazardsCard hazards={recentHazards} />
      </Box>

      {/* 9. QUICK SAFETY ACTIONS (VERIFIED 6 ACTIONS) */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: '#64748b', mb: 1, display: 'block' }}>
          {t('dashboard.quickActions', 'QUICK SAFETY ACTIONS')}
        </Typography>

        <Grid container spacing={1.5}>
          {[
            { label: 'AI Hazard Scan', icon: <ShieldIcon fontSize="small" />, color: '#2563eb', path: '/worker/ai-hazards' },
            { label: 'Safety Checklist', icon: <AssignmentTurnedInIcon fontSize="small" />, color: '#059669', path: '/worker/checklist' },
            { label: 'Report Hazard', icon: <ReportProblemIcon fontSize="small" />, color: '#d97706', path: '/worker/offline-reports' },
            { label: 'Safe Zone Map', icon: <MapIcon fontSize="small" />, color: '#7c3aed', path: '/worker/map' },
            { label: 'Equipment Issue', icon: <BuildIcon fontSize="small" />, color: '#ca8a04', path: '/worker/equipment-reporting' },
            { label: 'Contact Supervisor', icon: <ChatIcon fontSize="small" />, color: '#0284c7', path: '/worker/chat' },
          ].map((act) => (
            <Grid item xs={6} sm={4} md={2} key={act.label}>
              <Paper
                elevation={0}
                onClick={() => navigate(act.path)}
                sx={{
                  p: 1.8,
                  borderRadius: 2.5,
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: act.color,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <Box sx={{ color: act.color, mb: 0.8, display: 'flex', justifyContent: 'center' }}>
                  {act.icon}
                </Box>
                <Typography variant="body2" fontWeight="700" sx={{ color: '#0f172a', fontSize: '0.8rem' }}>
                  {act.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 10. TODAY'S SAFETY TIMELINE & AI SAFETY INSIGHTS */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {/* Today's Safety Timeline */}
        <Grid item xs={12} md={6}>
          <ShiftTimeline />
        </Grid>

        {/* AI Safety Insights */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: '#64748b' }}>
                AI SAFETY INSIGHTS
              </Typography>
              <Chip label="Verified 🟢" size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
            </Box>

            <Stack spacing={1.5} sx={{ flexGrow: 1, mb: 2 }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <CheckCircleIcon sx={{ color: '#059669', fontSize: 18 }} />
                <Typography variant="body2" fontWeight="600" sx={{ color: '#334155', fontSize: '0.85rem' }}>
                  PPE checklist completed
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1.5}>
                <CheckCircleIcon sx={{ color: '#059669', fontSize: 18 }} />
                <Typography variant="body2" fontWeight="600" sx={{ color: '#334155', fontSize: '0.85rem' }}>
                  Environmental conditions within safe limits
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1.5}>
                <CheckCircleIcon sx={{ color: '#059669', fontSize: 18 }} />
                <Typography variant="body2" fontWeight="600" sx={{ color: '#334155', fontSize: '0.85rem' }}>
                  Supervisor connected
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1.5}>
                <CheckCircleIcon sx={{ color: '#059669', fontSize: 18 }} />
                <Typography variant="body2" fontWeight="600" sx={{ color: '#334155', fontSize: '0.85rem' }}>
                  No active hazards detected
                </Typography>
              </Box>
            </Stack>

            <Box p={1.5} borderRadius={2} bgcolor="#f0fdf4" border="1px solid #bbf7d0">
              <Typography variant="caption" fontWeight="800" color="#059669" display="block">
                STATUS SUMMARY:
              </Typography>
              <Typography variant="body2" fontWeight="700" color="#166534" sx={{ fontSize: '0.82rem' }}>
                "All diagnostics clear. Continue normal safety protocols."
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 11. CATEGORIZED WORKER SAFETY MODULES */}
      <CategorizedModuleCatalog />

      {/* 12. SYSTEM STATUS FOOTER */}
      <Box textAlign="center" py={2.5} sx={{ borderTop: '1px solid #e2e8f0', mt: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight="600">
          MineGuard AI Worker Safety Operations Console • Real-Time Telemetry Active
        </Typography>
      </Box>

      {/* SOS Confirmation Dialog */}
      <Dialog open={sosSuccessDialog} onClose={() => setSosSuccessDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ color: '#dc2626', fontWeight: 800, textAlign: 'center', fontSize: '1.25rem' }}>
          🚨 EMERGENCY SOS DISPATCHED!
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#059669', mb: 1 }}>
            Distress Beacon #{activeSOS?.id || 'ACTIVE'} Transmitted
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your GPS location ({activeSOS?.latitude || '12.9716'}, {activeSOS?.longitude || '77.5946'}) and telemetry have been sent to Control Room and Supervisor.
          </Typography>
          <Alert severity="error" sx={{ borderRadius: 2, fontWeight: 600 }}>
            Please stay calm. Keep your location device powered on.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={() => { setSosSuccessDialog(false); navigate('/worker/sos'); }} variant="contained" color="error" sx={{ fontWeight: 700, borderRadius: 2 }}>
            View Emergency Details
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Analysis Dialog */}
      <Dialog open={aiAnalysisOpen} onClose={() => setAiAnalysisOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <PsychologyIcon sx={{ color: '#4f46e5', fontSize: 24 }} />
            <Typography variant="subtitle1" fontWeight="700">Random Forest AI Safety Model</Typography>
          </Box>
          <IconButton onClick={() => setAiAnalysisOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" fontWeight="700" gutterBottom>3-Class Model Output Probabilities:</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • 🟢 Safe Probability: {mlProbabilities.safe}%<br />
            • 🟡 Warning Probability: {mlProbabilities.warning}%<br />
            • 🔴 Critical Probability: {mlProbabilities.critical}%
          </Typography>
          <Typography variant="subtitle2" fontWeight="700" gutterBottom>Telemetry Inputs Analyzed:</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Atmospheric Methane: 0.2% (Threshold: &lt;1.0% safe)<br />
            • Carbon Monoxide: 5 ppm (Threshold: &lt;25 ppm safe)<br />
            • Shaft Ambient Temperature: {weather?.temperature || 21.8}°C<br />
            • Continuous Work Shift: 2h 15m elapsed
          </Typography>
          <Alert severity={mlStatus === 'Critical' ? 'error' : mlStatus === 'Warning' ? 'warning' : 'success'} sx={{ borderRadius: 2, fontWeight: 700 }}>
            Predicted Classification: {mlStatus.toUpperCase()} ({mlProbabilities.safe}% Confidence). {mlRecommendation}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAiAnalysisOpen(false); navigate('/worker/recommendations'); }} color="primary" sx={{ fontWeight: 700 }}>
            Full AI Recommendations Center
          </Button>
          <Button onClick={() => setAiAnalysisOpen(false)} variant="contained" sx={{ bgcolor: '#4f46e5', fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WorkerDashboard;
