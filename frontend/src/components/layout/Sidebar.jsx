import { useState, useEffect } from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, Box, Tooltip, Button, Badge, Typography, Avatar
} from '@mui/material';
import {
  Dashboard, People, Warning, Emergency, Assessment, Settings, Logout, Menu as MenuIcon, Close as CloseIcon, Brightness4, Brightness7, Map, NotificationsActive, Person, Schedule, Checklist, Lightbulb, ManageAccounts, HealthAndSafety, Announcement, Build, FactCheck, Message, BarChart, Assignment, ReportProblem, GpsFixed, EventAvailable, SupervisorAccount as SupervisorAccountIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import { LanguageSelector } from '../LanguageSelector';

export const Sidebar = ({ isDarkMode, onThemeToggle, userRole = 'worker', onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await apiClient.get('/notifications/unread-count');
        setUnreadCount(response.data?.unread_count || 0);
      } catch (err) {}
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const getMenuItems = () => {
    const commonItems = [{ label: t('navbar.dashboard'), icon: <Dashboard />, path: `/${userRole}/dashboard` }];

    if (userRole === 'worker') {
      return [
        ...commonItems,
        { label: t('navbar.ppe'), icon: <HealthAndSafety sx={{ color: '#38bdf8' }} />, path: '/worker/ppe' },
        { label: t('navbar.safetyScore'), icon: <BarChart sx={{ color: '#22c55e' }} />, path: '/worker/safety-score' },
        { label: t('navbar.offlineReports'), icon: <ReportProblem sx={{ color: '#f97316' }} />, path: '/worker/offline-reports' },
        { label: t('navbar.map'), icon: <Map sx={{ color: '#a855f7' }} />, path: '/worker/map' },
        { label: t('navbar.equipment'), icon: <Build sx={{ color: '#eab308' }} />, path: '/worker/equipment-reporting' },
        { label: t('navbar.shift'), icon: <Schedule sx={{ color: '#0284c7' }} />, path: '/worker/shift' },
        { label: t('navbar.incidentHistory'), icon: <FactCheck sx={{ color: '#ec4899' }} />, path: '/worker/incident-history' },
        { label: t('navbar.emergencySOS'), icon: <Emergency sx={{ color: '#f44336' }} />, path: '/worker/sos' },
        { label: t('navbar.aiHazards'), icon: <Warning sx={{ color: '#ff9800' }} />, path: '/worker/ai-hazards' },
        { label: t('navbar.chat'), icon: <Message sx={{ color: '#0288d1' }} />, path: '/worker/chat' },
        { label: t('navbar.attendance'), icon: <EventAvailable sx={{ color: '#4caf50' }} />, path: '/worker/attendance' },
        { label: t('navbar.weather'), icon: <Brightness7 sx={{ color: '#ffb300' }} />, path: '/worker/weather' },
        { label: t('navbar.streaks'), icon: <HealthAndSafety sx={{ color: '#9c27b0' }} />, path: '/worker/streaks' },
        { label: t('navbar.notifications'), icon: <NotificationsActive />, path: '/worker/notifications', badge: unreadCount },
        { label: t('navbar.profile'), icon: <Person />, path: '/worker/profile' },
      ];
    }

    if (userRole === 'admin') {
      return [
        ...commonItems,
        { label: t('navbar.workers'), icon: <People />, path: '/admin/workers' },
        { label: t('navbar.supervisors'), icon: <SupervisorAccountIcon />, path: '/admin/supervisors' },
        { label: t('navbar.map'), icon: <Map sx={{ color: '#38bdf8' }} />, path: '/admin/live-map' },
        { label: t('navbar.emergencySOS'), icon: <Emergency sx={{ color: '#f44336' }} />, path: '/admin/sos-center', badge: unreadCount > 0 ? '🚨' : 0 },
        { label: t('navbar.hazards'), icon: <Warning sx={{ color: '#ff9800' }} />, path: '/admin/hazards' },
        { label: t('navbar.equipment'), icon: <Build sx={{ color: '#eab308' }} />, path: '/admin/equipment' },
        { label: t('navbar.ppe'), icon: <HealthAndSafety sx={{ color: '#4ade80' }} />, path: '/admin/ppe-monitoring' },
        { label: t('navbar.attendance'), icon: <EventAvailable sx={{ color: '#0284c7' }} />, path: '/admin/attendance' },
        { label: t('navbar.safetyScore'), icon: <BarChart sx={{ color: '#22c55e' }} />, path: '/admin/safety-scores' },
        { label: t('navbar.zones'), icon: <GpsFixed sx={{ color: '#ef4444' }} />, path: '/admin/zones' },
        { label: t('navbar.notifications'), icon: <NotificationsActive />, path: '/admin/notifications', badge: unreadCount },
        { label: t('navbar.incidentHistory'), icon: <FactCheck sx={{ color: '#ec4899' }} />, path: '/admin/incident-history' },
        { label: t('navbar.analytics'), icon: <Assessment sx={{ color: '#38bdf8' }} />, path: '/admin/analytics' },
        { label: t('navbar.reports'), icon: <Assessment />, path: '/admin/reports' },
        { label: t('navbar.users'), icon: <ManageAccounts />, path: '/admin/users' },
        { label: t('navbar.settings'), icon: <Settings />, path: '/admin/settings' },
      ];
    }

    if (userRole === 'supervisor') {
      return [
        ...commonItems,
        { label: t('navbar.workers'), icon: <People />, path: '/supervisor/workers' },
        { label: t('navbar.liveTracking'), icon: <GpsFixed sx={{ color: '#38bdf8' }} />, path: '/supervisor/live-tracking' },
        { label: t('navbar.emergencySOS'), icon: <Emergency sx={{ color: '#f44336' }} />, path: '/supervisor/emergency-center', badge: unreadCount > 0 ? '🚨' : 0 },
        { label: t('navbar.hazards'), icon: <ReportProblem sx={{ color: '#ff9800' }} />, path: '/supervisor/hazards' },
        { label: t('navbar.equipment'), icon: <Build sx={{ color: '#eab308' }} />, path: '/supervisor/equipment' },
        { label: t('navbar.ppe'), icon: <HealthAndSafety sx={{ color: '#4ade80' }} />, path: '/supervisor/ppe-monitoring' },
        { label: t('navbar.attendance'), icon: <EventAvailable sx={{ color: '#0284c7' }} />, path: '/supervisor/attendance' },
        { label: t('navbar.safetyScore'), icon: <BarChart sx={{ color: '#22c55e' }} />, path: '/supervisor/safety-scores' },
        { label: t('navbar.zones'), icon: <Map sx={{ color: '#38bdf8' }} />, path: '/supervisor/zones' },
        { label: t('navbar.geofenceAlerts'), icon: <Warning sx={{ color: '#ef4444' }} />, path: '/supervisor/geofence-alerts' },
        { label: t('navbar.notifications'), icon: <NotificationsActive />, path: '/supervisor/notifications', badge: unreadCount },
        { label: t('navbar.shiftHandover'), icon: <Schedule sx={{ color: '#f59e0b' }} />, path: '/supervisor/shift-handover' },
        { label: t('navbar.analytics'), icon: <BarChart sx={{ color: '#38bdf8' }} />, path: '/supervisor/analytics' },
        { label: t('navbar.reports'), icon: <Assessment />, path: '/supervisor/reports' },
        { label: t('navbar.profile'), icon: <Person />, path: '/supervisor/profile' },
      ];
    }

    return commonItems;
  };

  const menuItems = getMenuItems();

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#4caf50', animation: 'pulse 2s infinite' }} />
            <Typography variant="h6" fontWeight="800" sx={{ tracking: 1, textTransform: 'uppercase', fontSize: 16 }}>
              MineGuard AI
            </Typography>
          </Box>
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: 'white', display: { md: 'none' } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: 1 }}>
          {(() => {
            const rawName = user?.username || 'User';
            const role = userRole || 'worker';
            const roleCap = role.charAt(0).toUpperCase() + role.slice(1);
            const badgeColor = role === 'admin' ? '#d32f2f' : role === 'supervisor' ? '#ed6c02' : '#2e7d32';
            return (
              <>
                <Avatar sx={{ width: 38, height: 38, bgcolor: badgeColor, fontSize: 14, fontWeight: 700 }}>
                  {rawName.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                    {rawName} ({roleCap})
                  </Typography>
                  <Box sx={{ fontSize: 10, bgcolor: badgeColor, color: 'white', px: 1, py: 0.2, borderRadius: 10, display: 'inline-block', fontWeight: 600 }}>
                    {role.toUpperCase()}
                  </Box>
                </Box>
              </>
            );
          })()}
        </Box>
      </Box>

      <Divider />

      <List sx={{ flex: 1, py: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => (
          <Tooltip key={item.path} title={item.label} placement="right">
            <ListItem disablePadding sx={{ mb: 0.3 }}>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  mx: 1, borderRadius: 2, py: 0.8,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main', color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' },
                    '&:hover': { backgroundColor: 'primary.dark' },
                  },
                  '&:hover': { backgroundColor: (theme) => theme.palette.action.hover, borderRadius: 2 },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {item.badge ? <Badge badgeContent={item.badge} color="error">{item.icon}</Badge> : item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13, fontWeight: isActive(item.path) ? 600 : 400 }} />
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>

      <Divider />
      <Box sx={{ p: 1.5 }}>
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', fontSize: 11 }}>
            🌐 {t('navbar.language')}
          </Typography>
          <LanguageSelector size="small" showLabel={false} />
        </Box>
        <Button onClick={onThemeToggle} fullWidth variant="outlined" size="small" sx={{ mb: 1, borderRadius: 2, fontSize: 12 }} startIcon={isDarkMode ? <Brightness7 /> : <Brightness4 />}>
          {isDarkMode ? 'Light' : 'Dark'} Mode
        </Button>
        <Button onClick={onLogout} fullWidth variant="outlined" size="small" color="error" startIcon={<Logout />} sx={{ borderRadius: 2, fontSize: 12 }}>
          {t('navbar.logout')}
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <IconButton onClick={() => setMobileOpen(!mobileOpen)} sx={{ display: { md: 'none' }, position: 'fixed', top: 16, left: 16, zIndex: 1200 }}>
        <MenuIcon />
      </IconButton>
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { xs: 'block', md: 'none' } }}>
        <Box sx={{ width: 260 }}>{drawerContent}</Box>
      </Drawer>
      <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 260, mt: 0 } }}>
        <Box sx={{ width: 260 }}>{drawerContent}</Box>
      </Drawer>
    </>
  );
};
