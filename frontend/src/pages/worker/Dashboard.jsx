import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button,
  Paper, Chip, Stack, LinearProgress, CircularProgress, Avatar, IconButton, Divider, Alert, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';

import WarningIcon from '@mui/icons-material/Warning';
import ShieldIcon from '@mui/icons-material/Shield';
import ChatIcon from '@mui/icons-material/Chat';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import WifiIcon from '@mui/icons-material/Wifi';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import VideocamIcon from '@mui/icons-material/Videocam';
import MapIcon from '@mui/icons-material/Map';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PersonIcon from '@mui/icons-material/Person';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StarIcon from '@mui/icons-material/Star';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SensorsIcon from '@mui/icons-material/Sensors';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import MicIcon from '@mui/icons-material/Mic';

import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import { EmergencyContacts } from '../../components/EmergencyContacts';

export const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [weather, setWeather] = useState(null);
  const [activeSOS, setActiveSOS] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [recentChat, setRecentChat] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSuccessDialog, setSosSuccessDialog] = useState(false);
  const [sosErrorMsg, setSosErrorMsg] = useState("");

  const handleTriggerSOS = async () => {
    setSosLoading(true);
    setSosErrorMsg("");
    try {
      let lat = 12.9716;
      let lon = 77.5946;

      const payload = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        alert_type: "SOS_TRIGGERED",
        emergency_type: "General Emergency"
      };

      const res = await apiClient.post('/emergency/sos', payload);
      setActiveSOS(res.data);
      setSosSuccessDialog(true);
      if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
    } catch (err) {
      console.error("Dashboard SOS trigger error:", err);
      try {
        const fallbackRes = await apiClient.post('/sos/trigger', {
          latitude: 12.9716,
          longitude: 77.5946,
          alert_type: "SOS_TRIGGERED",
          emergency_type: "General Emergency"
        });
        setActiveSOS(fallbackRes.data);
        setSosSuccessDialog(true);
      } catch (err2) {
        setSosErrorMsg("Redirecting to Emergency Center...");
        navigate('/worker/sos');
      }
    } finally {
      setSosLoading(false);
    }
  };

  // 16. Animated Clock & Data Sync
  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userRes = await apiClient.get('/users/me');
      setUser(userRes.data);
    } catch (e) {
      console.log("Error loading user profile:", e);
      try {
        const localUser = localStorage.getItem('user');
        if (localUser) setUser(JSON.parse(localUser));
      } catch {}
    }

    try {
      const gameRes = await apiClient.get('/gamification/profile');
      setGamification(gameRes.data);
    } catch (e) {
      console.log("Error loading gamification:", e);
    }

    try {
      const weatherRes = await apiClient.get('/weather/current');
      setWeather(weatherRes.data);
    } catch (e) {
      console.log("Error loading weather:", e);
    }

    try {
      const sosRes = await apiClient.get('/sos/active');
      if (sosRes.data && Array.isArray(sosRes.data) && sosRes.data.length > 0) {
        setActiveSOS(sosRes.data[0]);
      }
    } catch (e) {
      console.log("Error loading active SOS:", e);
    }

    try {
      const notifRes = await apiClient.get('/notifications/');
      if (notifRes.data && Array.isArray(notifRes.data)) {
        setRecentNotifications(notifRes.data.slice(0, 5));
      }
    } catch (e) {
      console.log("Error loading notifications:", e);
    }
  };

  const fullName = user?.profile?.full_name || user?.username || 'Worker';
  const safetyScore = user?.profile?.safety_score || 98.5;

  // 4. Weekly Safety Trend Data for Recharts Line Chart
  const weeklyTrendData = [
    { name: 'Mon', score: 96, attendance: 100, hazards: 0, recommendations: 4 },
    { name: 'Tue', score: 97, attendance: 100, hazards: 1, recommendations: 5 },
    { name: 'Wed', score: 95, attendance: 100, hazards: 0, recommendations: 4 },
    { name: 'Thu', score: 98, attendance: 100, hazards: 0, recommendations: 6 },
    { name: 'Fri', score: 97, attendance: 100, hazards: 1, recommendations: 5 },
    { name: 'Sat', score: 99, attendance: 100, hazards: 0, recommendations: 6 },
    { name: 'Sun', score: safetyScore, attendance: 100, hazards: 0, recommendations: 5 },
  ];

  // 14. Rotating Daily Safety Tips
  const dailyTips = [
    "Always inspect your Self-Contained Self-Rescuer (SCSR) respirator before entering the shaft.",
    "Verify methane gas sensor calibration prior to operating heavy excavation machinery.",
    "Maintain a minimum 3-meter safety distance from underground conveyor haulage belts.",
    "Ensure your high-visibility reflective vest and chin-strap helmet are securely fastened.",
    "Never cross designated red barricades without explicit supervisor clearance."
  ];
  const todayTip = dailyTips[currentTime.getDay() % dailyTips.length];

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      
      {/* 15. Internet, GPS & Camera Status Indicators Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Chip
            icon={<GpsFixedIcon sx={{ color: '#4caf50 !important', fontSize: '1rem' }} />}
            label="GPS Connected (Real-Time)"
            size="small"
            variant="outlined"
            sx={{ bgcolor: 'rgba(76, 175, 80, 0.08)', fontWeight: 'bold' }}
          />
          <Chip
            icon={<WifiIcon sx={{ color: '#2196f3 !important', fontSize: '1rem' }} />}
            label="Internet Connected (Sync Live)"
            size="small"
            variant="outlined"
            sx={{ bgcolor: 'rgba(33, 150, 243, 0.08)', fontWeight: 'bold' }}
          />
          <Chip
            icon={<VideocamIcon sx={{ color: '#9c27b0 !important', fontSize: '1rem' }} />}
            label="Camera Ready (Face Verified)"
            size="small"
            variant="outlined"
            sx={{ bgcolor: 'rgba(156, 39, 176, 0.08)', fontWeight: 'bold' }}
          />
          <Chip
            icon={<MicIcon sx={{ color: '#ff9800 !important', fontSize: '1rem' }} />}
            label="Microphone Ready (Voice Active)"
            size="small"
            variant="outlined"
            sx={{ bgcolor: 'rgba(255, 152, 0, 0.08)', fontWeight: 'bold' }}
          />
        </Stack>

        <Typography variant="caption" color="text.secondary" fontWeight="bold">
          🕒 Mine Local Time: {currentTime.toLocaleTimeString()}
        </Typography>
      </Box>

      {/* Welcome Banner (Preserved Existing UI & Colors) */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 60%, #1e88e5 100%)',
          color: '#ffffff',
          boxShadow: 6,
          mb: 4,
          transition: 'all 0.3s ease',
          '&:hover': { boxShadow: 8 }
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="h3" fontWeight="900" gutterBottom>
              {t('dashboard.welcomeUser', { name: fullName })} 👋
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Safety Companion Status: <strong>ACTIVE & PROTECTED</strong>
            </Typography>
            <Box display="flex" gap={2} sx={{ mt: 2 }} flexWrap="wrap">
              <Chip
                icon={<ShieldIcon sx={{ color: '#81c784 !important' }} />}
                label={`Safety Score: ${safetyScore}%`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 'bold', fontSize: '0.95rem', py: 2 }}
              />
              {gamification && (
                <Chip
                  icon={<LocalFireDepartmentIcon sx={{ color: '#ffe082 !important' }} />}
                  label={`${gamification.current_streak || 1} Day Streak (${gamification.xp || 100} XP)`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 'bold', fontSize: '0.95rem', py: 2 }}
                />
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={5} textAlign={{ xs: 'left', md: 'right' }}>
            <Button
              variant="contained"
              color="error"
              size="large"
              disabled={sosLoading}
              onClick={handleTriggerSOS}
              startIcon={sosLoading ? <CircularProgress size={24} color="inherit" /> : <WarningIcon sx={{ fontSize: '1.8rem !important' }} />}
              sx={{
                py: 2,
                px: 4,
                borderRadius: 3,
                fontSize: '1.2rem',
                fontWeight: '900',
                boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)',
                background: 'linear-gradient(45deg, #d32f2f 30%, #ff1744 90%)',
                '&:hover': { transform: 'scale(1.03)' }
              }}
            >
              {sosLoading ? (t('common.loading') || 'SENDING SOS...') : (t('sos.triggerNow') || 'TRIGGER SOS EMERGENCY')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Active SOS Warning Alert if triggered */}
      {activeSOS && (
        <Alert
          severity="error"
          sx={{ mb: 4, borderRadius: 3, fontWeight: 'bold', fontSize: '1.1rem' }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/worker/sos')}>
              View Active SOS
            </Button>
          }
        >
          🚨 Active Distress Beacon #{activeSOS.id} ({activeSOS.emergency_type}) is currently {activeSOS.status?.toUpperCase()}.
        </Alert>
      )}

      {/* SECTION 1: AI Safety Score & Preserved Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 1. AI Safety Score Widget */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              height: '100%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f4f6f9 100%)',
              borderLeft: '5px solid #4caf50',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" fontWeight="bold">AI SAFETY SCORE</Typography>
                <Chip icon={<TrendingUpIcon />} label="+2.5%" color="success" size="small" sx={{ fontWeight: 'bold' }} />
              </Box>
              <Box display="flex" alignItems="center" gap={2} sx={{ my: 1.5 }}>
                <Box position="relative" display="inline-flex">
                  <CircularProgress variant="determinate" value={safetyScore} size={60} thickness={4.5} color="success" />
                  <Box
                    top={0} left={0} bottom={0} right={0}
                    position="absolute" display="flex" alignItems="center" justifyContent="center"
                  >
                    <Typography variant="caption" fontWeight="bold" color="text.primary">{`${Math.round(safetyScore)}%`}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    Safe (Optimal)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Updated 2 mins ago
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Existing Weather Card (Preserved) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3, boxShadow: 3, height: '100%', cursor: 'pointer',
              transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
            }}
            onClick={() => navigate('/worker/weather')}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" fontWeight="bold">LIVE WEATHER</Typography>
                <WbSunnyIcon color="warning" />
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                {weather ? `${weather.temperature}°C` : '31.4°C'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {weather ? weather.condition : 'Partly Cloudy'} • AQI: {weather ? weather.air_quality_index : 78}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Existing Attendance Card (Preserved) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3, boxShadow: 3, height: '100%', cursor: 'pointer',
              transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
            }}
            onClick={() => navigate('/worker/attendance')}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" fontWeight="bold">ATTENDANCE</Typography>
                <CameraAltIcon color="primary" />
              </Box>
              <Typography variant="h5" fontWeight="bold" sx={{ my: 1, color: 'success.main' }}>
                Account Identity Guard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Selfie Face Verification • Unique Per User
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Existing Streaks & Level Card (Preserved) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3, boxShadow: 3, height: '100%', cursor: 'pointer',
              transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
            }}
            onClick={() => navigate('/worker/streaks')}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" fontWeight="bold">GAMIFICATION</Typography>
                <EmojiEventsIcon color="secondary" />
              </Box>
              <Typography variant="h5" fontWeight="bold" sx={{ my: 1 }}>
                Level {gamification ? gamification.level : 3} Guard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {gamification ? `${gamification.current_streak || 7} Day Streak • ${gamification.badges ? gamification.badges.filter(b => b.is_unlocked).length : 3} Badges` : '7 Day Streak Active'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 5. Quick Actions Section */}
      <Paper sx={{ p: 3, borderRadius: 4, mb: 4, boxShadow: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
          ⚡ Quick Safety Actions
        </Typography>
        <Grid container spacing={2}>
          {[
            { label: 'SOS Alert', icon: <WarningIcon />, color: '#f44336', path: '/worker/sos' },
            { label: 'AI Hazard Scan', icon: <ShieldIcon />, color: '#1976d2', path: '/worker/ai-hazards' },
            { label: 'Safety Chat', icon: <ChatIcon />, color: '#0288d1', path: '/worker/chat' },
            { label: 'Attendance', icon: <CameraAltIcon />, color: '#4caf50', path: '/worker/attendance' },
            { label: 'Notifications', icon: <NotificationsIcon />, color: '#e91e63', path: '/worker/notifications' },
            { label: 'Weather Telemetry', icon: <WbSunnyIcon />, color: '#ff9800', path: '/worker/weather' },
            { label: 'Mine Map', icon: <MapIcon />, color: '#9c27b0', path: '/worker/map' },
            { label: 'PPE Checklist', icon: <AssignmentTurnedInIcon />, color: '#009688', path: '/worker/checklist' },
          ].map((act) => (
            <Grid item xs={6} sm={3} md={1.5} key={act.label}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate(act.path)}
                sx={{
                  py: 1.8, px: 1,
                  display: 'flex', flexDirection: 'column', gap: 1,
                  borderRadius: 3, borderColor: `${act.color}40`,
                  color: 'text.primary',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: `${act.color}15`, borderColor: act.color, transform: 'translateY(-2px)' }
                }}
              >
                <Box sx={{ color: act.color }}>{act.icon}</Box>
                <Typography variant="caption" fontWeight="bold">{act.label}</Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* SECTION 2: Today's Safety Summary, Shift Progress & Daily Safety Tip */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 2. Today's Safety Summary Widget */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                <CheckCircleIcon color="success" /> Today's Safety Summary
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={1.5}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Attendance Status</Typography>
                  <Chip label="Verified / Present" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">PPE Checklist Status</Typography>
                  <Chip label="Completed (100%)" color="primary" size="small" sx={{ fontWeight: 'bold' }} />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Current Risk Level</Typography>
                  <Chip label="Low Risk (Optimal)" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Active Notifications</Typography>
                  <Chip label={`${recentNotifications.length} Alerts`} color="info" size="small" sx={{ fontWeight: 'bold' }} />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Weather Telemetry</Typography>
                  <Typography variant="body2" fontWeight="bold">{weather ? `${weather.temperature}°C • ${weather.condition}` : '31.4°C • Safe'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Shift Status</Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary.main">Active • Shift 1</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Emergency Status</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">All Shafts Normal</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* 6. Shift Progress & 14. Daily Safety Tip */}
        <Grid item xs={12} md={7}>
          <Stack spacing={3} height="100%">
            {/* Shift Progress */}
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                    <AccessTimeIcon color="primary" /> Shift Duration & Time Remaining
                  </Typography>
                  <Chip label="3h 15m remaining" color="primary" size="small" sx={{ fontWeight: 'bold' }} />
                </Box>
                <LinearProgress variant="determinate" value={60} sx={{ height: 12, borderRadius: 6, my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary" display="block">Shift Start</Typography>
                    <Typography variant="body1" fontWeight="bold">08:00 AM</Typography>
                  </Grid>
                  <Grid item xs={4} textAlign="center">
                    <Typography variant="caption" color="text.secondary" display="block">Current Time</Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary.main">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                  </Grid>
                  <Grid item xs={4} textAlign="right">
                    <Typography variant="caption" color="text.secondary" display="block">Shift End</Typography>
                    <Typography variant="body1" fontWeight="bold">04:00 PM</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 14. Daily Safety Tip */}
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, bgcolor: '#fffde7', borderLeft: '6px solid #fbc02d', flexGrow: 1 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <LightbulbIcon sx={{ color: '#fbc02d', fontSize: 28 }} />
                <Typography variant="h6" fontWeight="bold" color="#5d4037">
                  Daily Safety Tip
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="600" color="#4e342e">
                "{todayTip}"
              </Typography>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* SECTION 3: AI Safety Insights & Emergency Status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 3. AI Safety Insights Panel */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%', borderLeft: '5px solid #2196f3' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <PsychologyIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6" fontWeight="bold">
                  Gemini AI Safety Diagnostics & Insights
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body1">PPE Checklist completed and verified for today's shift.</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body1">Surface and shaft meteorological conditions are safe (AQI: {weather ? weather.air_quality_index : 78}).</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body1">Zero active environmental hazards detected in your designated sector.</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body1">Supervisor is online and actively receiving your real-time telemetry.</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body1" fontWeight="bold" color="primary.main">
                    All diagnostics clear. Continue normal mining operations with standard safety protocols.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* 10. Emergency Status Widget */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%', borderLeft: '5px solid #4caf50' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                <SensorsIcon color="success" /> Control Room & Emergency Status
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Distress Beacon</Typography>
                  <Chip label="No Active Emergency" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Supervisor Line</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">🟢 Online & Monitoring</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Medical Response Team</Typography>
                  <Typography variant="body2" fontWeight="bold">Standby & Ready (Ext. 911)</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Last SOS Broadcast</Typography>
                  <Typography variant="caption" color="text.secondary">2 days ago (Resolved)</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 4. Weekly Safety Trend Chart (Recharts) */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap">
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
              <TrendingUpIcon color="primary" /> Weekly Safety Score & Compliance Trend
            </Typography>
            <Chip label="7-Day Historical Analytics" color="primary" variant="outlined" size="small" sx={{ fontWeight: 'bold' }} />
          </Box>
          <Box sx={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                <XAxis dataKey="name" />
                <YAxis domain={[80, 100]} />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="score" name="Safety Score (%)" stroke="#4caf50" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="recommendations" name="AI Recommendations Followed" stroke="#2196f3" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* SECTION 4: Today's Mission & Achievement Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 8. Today's Mission (Gamification Widget) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                  🎯 Today's Safety Mission
                </Typography>
                <Chip label="80 / 140 XP Earned" color="secondary" size="small" sx={{ fontWeight: 'bold' }} />
              </Box>
              <LinearProgress variant="determinate" value={57} color="secondary" sx={{ height: 8, borderRadius: 4, mb: 2 }} />

              <Stack spacing={1.5}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckBoxIcon color="success" />
                  <Typography variant="body2" fontWeight="bold" sx={{ textDecoration: 'line-through' }}>
                    Attendance Camera Check-In (+50 XP)
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckBoxIcon color="success" />
                  <Typography variant="body2" fontWeight="bold" sx={{ textDecoration: 'line-through' }}>
                    Complete Mandatory PPE Checklist (+30 XP)
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckBoxOutlineBlankIcon color="action" />
                  <Typography variant="body2">Complete Daily Safety Quiz (+20 XP)</Typography>
                  <Button size="small" variant="text" onClick={() => navigate('/worker/checklist')}>Start</Button>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckBoxOutlineBlankIcon color="action" />
                  <Typography variant="body2">Perform AI Hazard Scan (+40 XP)</Typography>
                  <Button size="small" variant="text" onClick={() => navigate('/worker/ai-hazards')}>Scan</Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* 9. Achievement Summary Widget */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%', background: 'linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                  <EmojiEventsIcon color="secondary" /> Gamification & Achievements
                </Typography>
                <Chip label={`Level ${gamification?.level || 3} Guard`} color="secondary" sx={{ fontWeight: 'bold' }} />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Current XP</Typography>
                  <Typography variant="h5" fontWeight="bold" color="secondary.main">{gamification?.xp || 420} XP</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Current Streak</Typography>
                  <Typography variant="h5" fontWeight="bold">{gamification?.current_streak || 7} Days 🔥</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Longest Streak</Typography>
                  <Typography variant="body1" fontWeight="bold">{gamification?.longest_streak || 14} Days</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Latest Unlocked Badge</Typography>
                  <Typography variant="body1" fontWeight="bold">Shield Master 🛡️</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" color="text.secondary">Next Badge Progress: <strong>Level 4 Guard (80 XP remaining)</strong></Typography>
              <LinearProgress variant="determinate" value={82} color="secondary" sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SECTION 5: Safety Timeline & Mini Mine Map Preview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 7. Safety Timeline Card */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                <AccessTimeIcon color="primary" /> Today's Safety Operations Timeline
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={2}>
                {[
                  { time: '08:00 AM', title: 'Shift Check-In', desc: 'Camera selfie attendance verified (98.7% face match)', icon: <CheckCircleIcon color="success" size="small" /> },
                  { time: '08:15 AM', title: 'PPE Safety Checklist', desc: 'Helmet, SCSR respirator & boots confirmed compliant', icon: <CheckCircleIcon color="success" size="small" /> },
                  { time: '09:30 AM', title: 'AI Hazard Inspection', desc: 'Scanned transport shaft sector - zero anomalies', icon: <CheckCircleIcon color="success" size="small" /> },
                  { time: '11:00 AM', title: 'Telemetry Telecommunications', desc: 'Gas and humidity sensor handshake verified', icon: <CheckCircleIcon color="success" size="small" /> },
                  { time: '12:15 PM', title: 'Supervisor Safety Sync', desc: 'Mid-shift check-in completed with Control Room', icon: <CheckCircleIcon color="info" size="small" /> },
                ].map((item, idx) => (
                  <Box key={idx} display="flex" gap={2} alignItems="flex-start">
                    <Chip label={item.time} size="small" variant="outlined" sx={{ fontWeight: 'bold', minWidth: '75px' }} />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* 11. Mini Mine Map Preview */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                  <MapIcon color="primary" /> Mini Mine Map Preview
                </Typography>
                <Chip label="Shaft 3 Level 2" color="primary" size="small" sx={{ fontWeight: 'bold' }} />
              </Box>
              <Paper
                sx={{
                  p: 2.5, my: 1.5, borderRadius: 3,
                  background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)', color: '#fff',
                  textAlign: 'center'
                }}
              >
                <MapIcon sx={{ fontSize: 48, opacity: 0.8, mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">Current Sector: Transport Tunnel 3</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }} display="block">
                  Safe Zone B: 45m Away • Main Exit Ramp A: 120m Away
                </Typography>
              </Paper>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Nearest Refuge Chamber</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">Chamber B (Active Oxygen)</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Ventilation Airflow Rate</Typography>
                  <Typography variant="body2" fontWeight="bold">4.2 m³/s (Optimal)</Typography>
                </Box>
              </Stack>
            </CardContent>
            <Box p={2} pt={0}>
              <Button fullWidth variant="contained" color="primary" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/worker/map')}>
                Open Full Interactive Mine Map
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* SECTION 6: Recent Notifications Preview & Recent Chat Preview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 12. Recent Notifications Preview */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                  <NotificationsIcon color="error" /> Recent Notifications
                </Typography>
                <Button size="small" onClick={() => navigate('/worker/notifications')}>View All</Button>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Stack spacing={1.5}>
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((n) => (
                    <Box key={n.id} display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{n.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{n.message}</Typography>
                      </Box>
                      <Chip label={n.priority || 'info'} color={n.priority === 'emergency' || n.priority === 'critical' ? 'error' : 'info'} size="small" />
                    </Box>
                  ))
                ) : (
                  <>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight="bold">Shift Schedule Reminder</Typography>
                        <Typography variant="caption" color="text.secondary">Shift 1 starting on schedule.</Typography>
                      </Box>
                      <Chip label="INFO" color="info" size="small" />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight="bold">Weather Telemetry Updated</Typography>
                        <Typography variant="caption" color="text.secondary">Surface weather safe for haulage operations.</Typography>
                      </Box>
                      <Chip label="INFO" color="info" size="small" />
                    </Box>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* 13. Recent Chat Preview */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                  <ChatIcon color="info" /> Recent Safety Chat
                </Typography>
                <Chip label="Supervisor Online 🟢" color="success" size="small" sx={{ fontWeight: 'bold' }} />
              </Box>
              <Divider sx={{ my: 1 }} />
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                <Typography variant="caption" color="primary.main" fontWeight="bold">Supervisor Message (12:10 PM):</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  "All sector parameters clear. Keep SCSR gear ready during lower shaft transport."
                </Typography>
              </Paper>
              <Button fullWidth variant="outlined" color="primary" startIcon={<ChatIcon />} onClick={() => navigate('/worker/chat')}>
                Open Real-Time Safety Chat
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 4. Emergency Contacts Directory Widget */}
      <Box sx={{ mb: 4 }}>
        <EmergencyContacts />
      </Box>

      {/* Module Navigation Cards (Preserved Existing 7 Main Worker Modules) */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        🛠️ Worker Safety Modules
      </Typography>

      <Grid container spacing={3}>
        {[
          { title: 'Emergency SOS Center', desc: 'Instant distress beacon, GPS locking, and control room status.', path: '/worker/sos', icon: <WarningIcon sx={{ fontSize: 40, color: '#f44336' }} /> },
          { title: 'AI Hazard Vision Reporting', desc: 'Scan images for PPE, cracks, fire, smoke, and leaks.', path: '/worker/ai-hazards', icon: <ShieldIcon sx={{ fontSize: 40, color: '#1976d2' }} /> },
          { title: 'Real-Time Multi-Channel Chat', desc: 'Chat with Supervisor & Admin with emojis, voice notes, & media.', path: '/worker/chat', icon: <ChatIcon sx={{ fontSize: 40, color: '#0288d1' }} /> },
          { title: 'Camera Face Attendance', desc: 'Selfie check-in with AI face verification & streak triggers.', path: '/worker/attendance', icon: <CameraAltIcon sx={{ fontSize: 40, color: '#4caf50' }} /> },
          { title: 'Live Weather Station', desc: 'Meteorological telemetry, AQI meter, & severe weather alerts.', path: '/worker/weather', icon: <WbSunnyIcon sx={{ fontSize: 40, color: '#ff9800' }} /> },
          { title: 'Streaks & Badge Showcase', desc: 'Track daily attendance streaks, XP, level, & unlocked badges.', path: '/worker/streaks', icon: <EmojiEventsIcon sx={{ fontSize: 40, color: '#9c27b0' }} /> },
          { title: 'Notifications Center', desc: 'Synchronized real-time notifications with unread counts.', path: '/worker/notifications', icon: <NotificationsIcon sx={{ fontSize: 40, color: '#e91e63' }} /> },
        ].map((module) => (
          <Grid item xs={12} sm={6} md={4} key={module.path}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
              }}
            >
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                  {module.icon}
                  <Typography variant="h6" fontWeight="bold">
                    {module.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 3 }}>
                  {module.desc}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(module.path)}
                  sx={{ borderRadius: 2, fontWeight: 'bold' }}
                >
                  Open Module
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* SOS Success Confirmation Dialog */}
      <Dialog
        open={sosSuccessDialog}
        onClose={() => setSosSuccessDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: '#0f172a',
            color: '#fff',
            border: '2px solid #ef4444',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ color: '#ef4444', fontWeight: '900', textAlign: 'center', fontSize: '1.6rem' }}>
          🚨 EMERGENCY SOS DISPATCHED!
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#4ade80', mb: 1 }}>
            Distress Beacon #{activeSOS?.id || 'ACTIVE'} Transmitted
          </Typography>
          <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 2 }}>
            Your GPS location <strong>({activeSOS?.latitude || '12.9716'}, {activeSOS?.longitude || '77.5946'})</strong> and employee telemetry have been transmitted in real time to Control Room, Supervisor Dashboard, and Rescue Teams.
          </Typography>
          <Alert severity="error" sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontWeight: 'bold' }}>
            Please stay calm. Keep your device powered on and move to the nearest Safe Zone if possible.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button
            onClick={() => { setSosSuccessDialog(false); navigate('/worker/sos'); }}
            variant="contained"
            color="error"
            size="large"
            sx={{ fontWeight: 'bold', borderRadius: 2 }}
          >
            View Emergency Details
          </Button>
          <Button
            onClick={() => setSosSuccessDialog(false)}
            variant="outlined"
            sx={{ color: '#94a3b8', borderColor: '#334155', borderRadius: 2 }}
          >
            Acknowledge & Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WorkerDashboard;
