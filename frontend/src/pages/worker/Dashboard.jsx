import { Box, Grid, Card, CardContent, Typography, Button, IconButton, Avatar, Chip, LinearProgress } from '@mui/material';
import { WbSunny, Cloud, LocalFireDepartment, Warning, Assignment, Sos, DirectionsRun } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useGeo } from '../../context/GeolocationContext';

export const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { location } = useGeo();

  const [userProfile, setUserProfile] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [zones, setZones] = useState([]);
  const [shift, setShift] = useState({ current: 'No Active Shift', hoursWorked: 0, totalHours: 8 });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await apiClient.get('/users/me');
        setUserProfile(response.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    const fetchRisk = async () => {
      try {
        const response = await apiClient.get('/safety/risk-level');
        setRiskData(response.data);
      } catch (err) {
        console.error("Failed to fetch risk level:", err);
      }
    };
    const fetchZones = async () => {
      try {
        const response = await apiClient.get('/locations/zones');
        setZones(response.data);
      } catch (err) {
        console.error("Failed to fetch zones:", err);
      }
    };
    const fetchShift = async () => {
      try {
        const response = await apiClient.get('/shifts/active');
        if (response.data) {
          const start = new Date(response.data.start_time);
          const now = new Date();
          const hrs = Math.min(8.0, parseFloat(((now - start) / (1000 * 3600)).toFixed(1)));
          setShift({
            current: `Active Shift since ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
            hoursWorked: hrs,
            totalHours: 8.0
          });
        }
      } catch (err) {
        console.error("Failed to fetch active shift:", err);
      }
    };
    const fetchNotifications = async () => {
      try {
        const response = await apiClient.get('/notifications/');
        if (response.data) {
          const mapped = response.data.slice(0, 3).map(n => ({
            id: n.id,
            type: n.type === 'hazard_warning' ? 'Hazard Alert' : 'Safety Update',
            msg: n.message,
            time: new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            color: n.type === 'hazard_warning' ? 'error.main' : 'info.main'
          }));
          setAlerts(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchMe();
    fetchRisk();
    fetchZones();
    fetchShift();
    fetchNotifications();

    const intervalRisk = setInterval(fetchRisk, 15000);
    const intervalNotif = setInterval(fetchNotifications, 15000);
    return () => {
      clearInterval(intervalRisk);
      clearInterval(intervalNotif);
    };
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  let activeZoneName = null;
  if (location && zones.length > 0) {
    for (const zone of zones) {
      if (zone.coordinates && zone.geometry_type === 'circle') {
        const dist = calculateDistance(
          location.latitude,
          location.longitude,
          parseFloat(zone.coordinates.latitude),
          parseFloat(zone.coordinates.longitude)
        );
        if (dist <= parseFloat(zone.coordinates.radius)) {
          activeZoneName = zone.name;
          break;
        }
      }
    }
  }

  const getStatusColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'success.main';
      case 'medium': return 'warning.main';
      case 'high': return 'error.main';
      case 'critical': return 'error.dark';
      default: return 'success.main';
    }
  };

  const getStatusLabel = (level) => {
    if (!level) return 'LOADING...';
    return `${level.toUpperCase()} RISK`;
  };

  const safetyStatus = {
    status: getStatusLabel(riskData?.risk_level),
    color: getStatusColor(riskData?.risk_level),
    score: riskData ? riskData.risk_score : 0
  };

  const environment = {
    weather: 'Sunny',
    surfaceTemp: '32°C',
    mineTemp: '28°C',
    location: activeZoneName 
      ? activeZoneName 
      : location 
        ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` 
        : (userProfile?.profile?.mine_location || 'Loading Location...')
  };

  const initials = userProfile?.profile?.full_name 
    ? userProfile.profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'JD';

  return (
    <Box sx={{ py: 2 }}>
      {/* Header / Greeting */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', mr: 2 }}>{initials}</Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Hello, {userProfile?.profile?.full_name || userProfile?.username || 'Worker'}</Typography>
          <Typography variant="body2" color="textSecondary">Stay safe today.</Typography>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* Safety Status & Risk Score */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Safety Status</Typography>
                <Chip label={safetyStatus.status} sx={{ bgcolor: safetyStatus.color, color: '#fff', fontWeight: 'bold' }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: safetyStatus.color, mr: 1 }}>
                  {safetyStatus.score}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>/ 100 Risk Score</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={safetyStatus.score} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': { bgcolor: safetyStatus.color }
                }} 
              />
              <Button 
                variant="text" 
                sx={{ mt: 2, p: 0, fontWeight: 'bold' }}
                onClick={() => navigate('/worker/risk-analysis')}
              >
                View Full Analysis &rarr;
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Shift Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Current Shift</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                {shift.current}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="textSecondary">Hours Worked</Typography>
                <Typography variant="body2" fontWeight="bold">{shift.hoursWorked} / {shift.totalHours} hrs</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={shift.totalHours > 0 ? (shift.hoursWorked / shift.totalHours) * 100 : 0} 
                sx={{ height: 8, borderRadius: 4 }} 
                color="primary"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Environment & Location */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-around' }}>
              <Box sx={{ textAlign: 'center' }}>
                <WbSunny sx={{ color: 'warning.main', fontSize: 32, mb: 1 }} />
                <Typography variant="body2" color="textSecondary">Surface</Typography>
                <Typography variant="body1" fontWeight="bold">{environment.surfaceTemp}</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Cloud sx={{ color: 'info.main', fontSize: 32, mb: 1 }} />
                <Typography variant="body2" color="textSecondary">Mine</Typography>
                <Typography variant="body1" fontWeight="bold">{environment.mineTemp}</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <DirectionsRun sx={{ color: 'success.main', fontSize: 32, mb: 1 }} />
                <Typography variant="body2" color="textSecondary">Location</Typography>
                <Typography variant="body1" fontWeight="bold">{environment.location}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>Quick Actions</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => navigate('/worker/checklist')}>
                <CardContent sx={{ p: 2 }}>
                  <Assignment sx={{ color: 'primary.main', fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" fontWeight="bold">Checklist</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => navigate('/worker/hazards')}>
                <CardContent sx={{ p: 2 }}>
                  <Warning sx={{ color: 'warning.main', fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" fontWeight="bold">Report Hazard</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => navigate('/worker/ai-prediction')}>
                <CardContent sx={{ p: 2 }}>
                  <LocalFireDepartment sx={{ color: 'error.main', fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" fontWeight="bold">AI Sensors</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', bgcolor: 'error.light', color: '#fff', cursor: 'pointer' }} onClick={() => navigate('/worker/map')}>
                <CardContent sx={{ p: 2 }}>
                  <Sos sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" fontWeight="bold">SOS / Map</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>Recent Alerts</Typography>
          {alerts.length === 0 ? (
            <Card variant="outlined" sx={{ py: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">No alerts at the moment.</Typography>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} sx={{ mb: 1, borderLeft: `6px solid`, borderColor: alert.color }}>
                <CardContent sx={{ py: '12px !important', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" color={alert.color}>{alert.type}</Typography>
                    <Typography variant="body2">{alert.msg}</Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">{alert.time}</Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Grid>

      </Grid>
    </Box>
  );
};
