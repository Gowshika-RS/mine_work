import { useState, useEffect } from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, IconButton, Box, Tooltip, Button, Badge, Typography, Avatar, ListSubheader, Stack
} from '@mui/material';
import {
  Dashboard, People, Warning, Emergency, Assessment, Settings, Logout,
  Menu as MenuIcon, Close as CloseIcon, Brightness4, Brightness7, Map,
  NotificationsActive, Person, Schedule, Checklist, Lightbulb, ManageAccounts,
  HealthAndSafety, Announcement, Build, FactCheck, Message, BarChart,
  Assignment, ReportProblem, GpsFixed, EventAvailable,
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  SupervisorAccount as SupervisorAccountIcon, Shield,
  Sync as SyncIcon, Sensors as SensorsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import { LanguageSelector } from '../LanguageSelector';

export const Sidebar = ({ isDarkMode, onThemeToggle, userRole = 'worker', onLogout, collapsed, onToggleCollapse }) => {
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

  // Structured Grouped Menu Items for Worker
  const getWorkerGroupedMenu = () => [
    {
      category: 'MAIN',
      items: [
        { label: t('navbar.dashboard') || 'Dashboard', icon: <Dashboard sx={{ color: '#6366f1' }} />, path: '/worker/dashboard' }
      ]
    },
    {
      category: 'SAFETY',
      items: [
        { label: t('navbar.safetyScore') || 'Personal Safety Score', icon: <BarChart sx={{ color: '#10b981' }} />, path: '/worker/safety-score' },
        { label: t('navbar.ppe') || 'PPE Verification', icon: <HealthAndSafety sx={{ color: '#38bdf8' }} />, path: '/worker/ppe' },
        { label: 'Safety Checklist', icon: <Checklist sx={{ color: '#14b8a6' }} />, path: '/worker/checklist' },
        { label: t('navbar.aiHazards') || 'AI Hazard Reporting', icon: <Warning sx={{ color: '#f59e0b' }} />, path: '/worker/ai-hazards' },
        { label: t('navbar.incidentHistory') || 'Incident History', icon: <FactCheck sx={{ color: '#ec4899' }} />, path: '/worker/incident-history' }
      ]
    },
    {
      category: 'OPERATIONS',
      items: [
        { label: 'Safe Zone Navigation', icon: <Map sx={{ color: '#8b5cf6' }} />, path: '/worker/map' },
        { label: t('navbar.equipment') || 'Equipment Issues', icon: <Build sx={{ color: '#eab308' }} />, path: '/worker/equipment-reporting' },
        { label: 'Shift Monitoring', icon: <Schedule sx={{ color: '#0284c7' }} />, path: '/worker/shift' },
        { label: t('navbar.attendance') || 'Camera Attendance', icon: <EventAvailable sx={{ color: '#10b981' }} />, path: '/worker/attendance' },
        { label: t('navbar.weather') || 'Live Weather', icon: <Brightness7 sx={{ color: '#ffb300' }} />, path: '/worker/weather' }
      ]
    },
    {
      category: 'COMMUNICATION',
      items: [
        { label: t('navbar.emergencySOS') || 'Emergency SOS', icon: <Emergency sx={{ color: '#ef4444' }} />, path: '/worker/sos' },
        { label: t('navbar.chat') || 'Real-Time Chat', icon: <Message sx={{ color: '#0288d1' }} />, path: '/worker/chat' },
        { label: 'Leave Requests', icon: <EventAvailable sx={{ color: '#eab308' }} />, path: '/worker/leave' },
        { label: t('navbar.notifications') || 'Notifications', icon: <NotificationsActive sx={{ color: '#ec4899' }} />, path: '/worker/notifications', badge: unreadCount }
      ]
    },
    {
      category: 'GAMIFICATION',
      items: [
        { label: t('navbar.streaks') || 'Streaks & Badges', icon: <Shield sx={{ color: '#a855f7' }} />, path: '/worker/streaks' }
      ]
    }
  ];

  const getMenuItemsForOthers = () => {
    if (userRole === 'admin') {
      return [
        {
          category: 'ADMINISTRATION',
          items: [
            { label: t('navbar.dashboard') || 'Dashboard', icon: <Dashboard sx={{ color: '#6366f1' }} />, path: '/admin/dashboard' },
            { label: t('navbar.workers') || 'Workers', icon: <People sx={{ color: '#10b981' }} />, path: '/admin/workers' },
            { label: t('navbar.supervisors') || 'Supervisors', icon: <SupervisorAccountIcon sx={{ color: '#8b5cf6' }} />, path: '/admin/supervisors' },
            { label: 'User Management', icon: <ManageAccounts sx={{ color: '#ec4899' }} />, path: '/admin/users' },
            { label: 'Leave Management', icon: <EventAvailable sx={{ color: '#eab308' }} />, path: '/admin/leave' },
            { label: t('navbar.map') || 'Live Map', icon: <Map sx={{ color: '#38bdf8' }} />, path: '/admin/live-map' },
            { label: t('navbar.emergencySOS') || 'SOS Center', icon: <Emergency sx={{ color: '#f44336' }} />, path: '/admin/sos-center', badge: unreadCount > 0 ? '🚨' : 0 },
            { label: t('navbar.hazards') || 'Hazards', icon: <Warning sx={{ color: '#ff9800' }} />, path: '/admin/hazards' },
            { label: t('navbar.equipment') || 'Equipment', icon: <Build sx={{ color: '#eab308' }} />, path: '/admin/equipment' },
            { label: t('navbar.ppe') || 'PPE Monitoring', icon: <HealthAndSafety sx={{ color: '#4ade80' }} />, path: '/admin/ppe-monitoring' },
            { label: 'Safety Checklists', icon: <Checklist sx={{ color: '#14b8a6' }} />, path: '/admin/checklists' },
            { label: 'Attendance & Shifts', icon: <Schedule sx={{ color: '#0284c7' }} />, path: '/admin/attendance' },
            { label: 'Safety Scores', icon: <BarChart sx={{ color: '#10b981' }} />, path: '/admin/safety-scores' },
            { label: 'Mine Zones & Geofencing', icon: <GpsFixed sx={{ color: '#a855f7' }} />, path: '/admin/zones' },
            { label: 'Environment Monitoring', icon: <Brightness7 sx={{ color: '#38bdf8' }} />, path: '/admin/environment' },
            { label: 'Communication Center', icon: <Message sx={{ color: '#0288d1' }} />, path: '/admin/communication' },
            { label: t('navbar.notifications') || 'Notifications', icon: <NotificationsActive sx={{ color: '#ec4899' }} />, path: '/admin/notifications', badge: unreadCount },
            { label: t('navbar.analytics') || 'Analytics', icon: <Assessment sx={{ color: '#38bdf8' }} />, path: '/admin/analytics' },
            { label: 'Incident History', icon: <FactCheck sx={{ color: '#f43f5e' }} />, path: '/admin/incident-history' },
            { label: 'Reports', icon: <Assignment sx={{ color: '#6366f1' }} />, path: '/admin/reports' },
            { label: 'Settings', icon: <Settings sx={{ color: '#94a3b8' }} />, path: '/admin/settings' }
          ]
        }
      ];
    }
    if (userRole === 'supervisor') {
      return [
        {
          category: 'MAIN',
          items: [
            { label: t('navbar.dashboard') || 'Dashboard', icon: <Dashboard sx={{ color: '#6366f1' }} />, path: '/supervisor/dashboard' },
            { label: 'Supervisor Profile', icon: <Person sx={{ color: '#38bdf8' }} />, path: '/supervisor/profile' }
          ]
        },
        {
          category: 'WORKFORCE & SHIFTS',
          items: [
            { label: t('navbar.workers') || 'Team Workers', icon: <People sx={{ color: '#10b981' }} />, path: '/supervisor/workers' },
            { label: 'Shift Roster', icon: <Schedule sx={{ color: '#0284c7' }} />, path: '/supervisor/shifts' },
            { label: 'Attendance', icon: <EventAvailable sx={{ color: '#10b981' }} />, path: '/supervisor/attendance' },
            { label: 'Leave Requests', icon: <FactCheck sx={{ color: '#eab308' }} />, path: '/supervisor/leave' },
            { label: 'Shift Handover', icon: <SyncIcon sx={{ color: '#8b5cf6' }} />, path: '/supervisor/shift-handover' },
            { label: 'Task Assignments', icon: <Assignment sx={{ color: '#38bdf8' }} />, path: '/supervisor/tasks' }
          ]
        },
        {
          category: 'MONITORING & HEALTH',
          items: [
            { label: t('navbar.liveTracking') || 'Live Worker Tracking', icon: <GpsFixed sx={{ color: '#38bdf8' }} />, path: '/supervisor/live-tracking' },
            { label: 'PPE Compliance', icon: <HealthAndSafety sx={{ color: '#4ade80' }} />, path: '/supervisor/ppe-monitoring' },
            { label: 'Precaution Checklists', icon: <Checklist sx={{ color: '#14b8a6' }} />, path: '/supervisor/checklists' },
            { label: 'Worker Health Monitoring', icon: <HealthAndSafety sx={{ color: '#ec4899' }} />, path: '/supervisor/health' },
            { label: 'Safety Scores', icon: <BarChart sx={{ color: '#10b981' }} />, path: '/supervisor/safety-scores' }
          ]
        },
        {
          category: 'HAZARDS & ENVIRONMENT',
          items: [
            { label: t('navbar.hazards') || 'Hazard Review', icon: <ReportProblem sx={{ color: '#ff9800' }} />, path: '/supervisor/hazards' },
            { label: 'Mine Zones & Geofencing', icon: <Map sx={{ color: '#a855f7' }} />, path: '/supervisor/zones' },
            { label: 'Geofence Alerts', icon: <Warning sx={{ color: '#f43f5e' }} />, path: '/supervisor/geofence-alerts' },
            { label: 'Environment Telemetry', icon: <Brightness7 sx={{ color: '#38bdf8' }} />, path: '/supervisor/environment' },
            { label: 'Mine Monitoring Hub', icon: <SensorsIcon sx={{ color: '#0284c7' }} />, path: '/supervisor/mine-monitoring' },
            { label: 'Equipment Monitoring', icon: <Build sx={{ color: '#eab308' }} />, path: '/supervisor/equipment' }
          ]
        },
        {
          category: 'EMERGENCY & INCIDENTS',
          items: [
            { label: 'Emergency Center', icon: <Emergency sx={{ color: '#f44336' }} />, path: '/supervisor/emergency-center', badge: unreadCount > 0 ? '🚨' : 0 },
            { label: 'Incident Management', icon: <FactCheck sx={{ color: '#ef4444' }} />, path: '/supervisor/incidents' }
          ]
        },
        {
          category: 'COMMUNICATION & REPORTS',
          items: [
            { label: 'Team Communications', icon: <Message sx={{ color: '#0288d1' }} />, path: '/supervisor/communication' },
            { label: 'Site Announcements', icon: <Announcement sx={{ color: '#eab308' }} />, path: '/supervisor/announcements' },
            { label: t('navbar.analytics') || 'Safety Analytics', icon: <BarChart sx={{ color: '#38bdf8' }} />, path: '/supervisor/analytics' },
            { label: 'Reports', icon: <Assignment sx={{ color: '#6366f1' }} />, path: '/supervisor/reports' },
            { label: t('navbar.notifications') || 'Notifications', icon: <NotificationsActive sx={{ color: '#ec4899' }} />, path: '/supervisor/notifications', badge: unreadCount }
          ]
        }
      ];
    }
    if (userRole === 'emergency_officer') {
      return [
        {
          category: 'MAIN',
          items: [
            { label: 'Emergency Command', icon: <Dashboard sx={{ color: '#ef4444' }} />, path: '/emergency/dashboard' },
            { label: 'Commander Profile', icon: <Person sx={{ color: '#38bdf8' }} />, path: '/emergency/profile' }
          ]
        },
        {
          category: 'EMERGENCY OPERATIONS',
          items: [
            { label: 'Live SOS Center', icon: <Emergency sx={{ color: '#ef4444' }} />, path: '/emergency/sos-center', badge: unreadCount > 0 ? '🚨' : 0 },
            { label: 'Rescue & Live Map', icon: <Map sx={{ color: '#38bdf8' }} />, path: '/emergency/live-map' },
            { label: 'Disaster Hazard Hub', icon: <Warning sx={{ color: '#f59e0b' }} />, path: '/emergency/hazards' }
          ]
        },
        {
          category: 'RESCUE & ALARM SYSTEMS',
          items: [
            { label: 'Rescue Squad Dispatch', icon: <HealthAndSafety sx={{ color: '#10b981' }} />, path: '/emergency/dispatch' },
            { label: 'Emergency Broadcast Sirens', icon: <Announcement sx={{ color: '#dc2626' }} />, path: '/emergency/broadcast' },
            { label: 'Gas & Environmental Alarms', icon: <Brightness7 sx={{ color: '#38bdf8' }} />, path: '/emergency/environment' }
          ]
        },
        {
          category: 'LOGS & COMMUNICATION',
          items: [
            { label: 'Emergency Communications', icon: <Message sx={{ color: '#0288d1' }} />, path: '/emergency/communication' },
            { label: 'Leave Requests', icon: <EventAvailable sx={{ color: '#eab308' }} />, path: '/emergency/leave' },
            { label: 'Incident Audit Logs', icon: <FactCheck sx={{ color: '#ec4899' }} />, path: '/emergency/incidents' },
            { label: 'Notifications', icon: <NotificationsActive sx={{ color: '#ec4899' }} />, path: '/emergency/notifications', badge: unreadCount }
          ]
        }
      ];
    }
    return [{ category: 'MAIN', items: [{ label: t('navbar.dashboard'), icon: <Dashboard />, path: `/${userRole}/dashboard` }] }];
  };

  const menuGroups = userRole === 'worker' ? getWorkerGroupedMenu() : getMenuItemsForOthers();

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const drawerWidth = collapsed ? 76 : 260;

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#0b0f17', color: '#f8fafc', overflow: 'hidden' }}>
      {/* Brand & Collapse Header */}
      <Box sx={{ p: 2, background: 'linear-gradient(180deg, #0b0f17 0%, #151c2c 100%)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)' }} />
            {!collapsed && (
              <Typography variant="h6" fontWeight="800" sx={{ letterSpacing: '0.05em', color: '#ffffff', fontSize: 15 }}>
                MINEGUARD AI
              </Typography>
            )}
          </Box>
          <Box display="flex" alignItems="center">
            {onToggleCollapse && (
              <IconButton onClick={onToggleCollapse} sx={{ color: '#94a3b8', display: { xs: 'none', md: 'flex' } }} size="small">
                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            )}
            <IconButton onClick={() => setMobileOpen(false)} sx={{ color: '#94a3b8', display: { md: 'none' } }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: 2 }}>
            {(() => {
              const rawName = user?.profile?.full_name || user?.username || 'Gowshi';
              const role = userRole || 'worker';
              const roleCap = role.charAt(0).toUpperCase() + role.slice(1);
              const badgeColor = role === 'admin' ? '#f43f5e' : role === 'supervisor' ? '#f59e0b' : '#10b981';
              return (
                <>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: badgeColor, fontSize: 14, fontWeight: 700 }}>
                    {rawName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {rawName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: 11 }}>
                      {roleCap} • Shift 1
                    </Typography>
                  </Box>
                </>
              );
            })()}
          </Box>
        )}
      </Box>

      {/* Grouped List Items */}
      <List sx={{ flex: 1, py: 1, px: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 } }}>
        {menuGroups.map((group, gIdx) => (
          <Box key={group.category || gIdx} sx={{ mb: 1.5 }}>
            {!collapsed && group.category && (
              <Typography
                variant="caption"
                sx={{
                  px: 1.5, py: 0.5, display: 'block',
                  fontSize: '0.68rem', fontWeight: 800,
                  letterSpacing: '0.08em', color: '#64748b'
                }}
              >
                {group.category}
              </Typography>
            )}

            {group.items.map((item) => {
              const active = isActive(item.path);
              return (
                <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right">
                  <ListItem disablePadding sx={{ mb: 0.4 }}>
                    <ListItemButton
                      selected={active}
                      onClick={() => handleNavigate(item.path)}
                      sx={{
                        borderRadius: 2, py: 0.8, px: collapsed ? 1.5 : 1.5,
                        justifyContent: collapsed ? 'center' : 'initial',
                        '&.Mui-selected': {
                          bgcolor: '#4f46e5', color: '#ffffff',
                          '& .MuiListItemIcon-root': { color: '#ffffff' },
                          '&:hover': { bgcolor: '#4338ca' },
                        },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: collapsed ? 0 : 34, color: active ? '#ffffff' : '#94a3b8', justifyContent: 'center' }}>
                        {item.badge ? <Badge badgeContent={item.badge} color="error">{item.icon}</Badge> : item.icon}
                      </ListItemIcon>
                      {!collapsed && (
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#ffffff' : '#cbd5e1' }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
              );
            })}
          </Box>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

      {/* Footer Controls */}
      <Box sx={{ p: 1.5, bgcolor: '#0b0f17' }}>
        {!collapsed && (
          <Box sx={{ mb: 1 }}>
            <LanguageSelector size="small" showLabel={false} />
          </Box>
        )}
        <Stack direction={collapsed ? "column" : "row"} spacing={1}>
          <Tooltip title={collapsed ? "Toggle Theme" : ""}>
            <Button
              onClick={onThemeToggle}
              fullWidth
              variant="outlined"
              size="small"
              sx={{ borderRadius: 2, fontSize: 11, color: '#94a3b8', borderColor: 'rgba(255,255,255,0.12)', minWidth: 0 }}
            >
              {isDarkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
              {!collapsed && <Box component="span" sx={{ ml: 1 }}>Theme</Box>}
            </Button>
          </Tooltip>

          <Tooltip title={collapsed ? "Logout" : ""}>
            <Button
              onClick={onLogout}
              fullWidth
              variant="outlined"
              size="small"
              color="error"
              sx={{ borderRadius: 2, fontSize: 11, minWidth: 0 }}
            >
              <Logout fontSize="small" />
              {!collapsed && <Box component="span" sx={{ ml: 1 }}>{t('navbar.logout')}</Box>}
            </Button>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <>
      <IconButton onClick={() => setMobileOpen(!mobileOpen)} sx={{ display: { md: 'none' }, position: 'fixed', top: 16, left: 16, zIndex: 1200, bgcolor: '#0f172a', color: '#fff', '&:hover': { bgcolor: '#1e293b' } }}>
        <MenuIcon />
      </IconButton>

      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { xs: 'block', md: 'none' } }}>
        <Box sx={{ width: 260 }}>{drawerContent}</Box>
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            transition: 'width 0.25s ease',
            borderRight: '1px solid rgba(255,255,255,0.08)'
          }
        }}
      >
        <Box sx={{ width: drawerWidth, transition: 'width 0.25s ease', height: '100%' }}>{drawerContent}</Box>
      </Drawer>
    </>
  );
};

export default Sidebar;
