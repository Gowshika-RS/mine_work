import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Box,
  Tooltip,
  Button,
} from '@mui/material';

import {
  Dashboard,
  People,
  Warning,
  Emergency,
  Assessment,
  Settings,
  Logout,
  Menu as MenuIcon,
  Close as CloseIcon,
  Brightness4,
  Brightness7,
  Map,
  NotificationsActive,
  Person,
  Schedule,
  Checklist,
  Lightbulb,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export const Sidebar = ({ isDarkMode, onThemeToggle, userRole = 'worker', onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getMenuItems = () => {
    const commonItems = [
      {
        label: 'Dashboard',
        icon: <Dashboard />,
        path: `/${userRole}/dashboard`,
      },
    ];

    if (userRole === 'worker') {
      return [
        ...commonItems,
        { label: 'Profile', icon: <Person />, path: '/worker/profile' },
        { label: 'Shift', icon: <Schedule />, path: '/worker/shift' },
        { label: 'Map', icon: <Map />, path: '/worker/map' },
        { label: 'Hazards', icon: <Warning />, path: '/worker/hazards' },
        { label: 'Checklist', icon: <Checklist />, path: '/worker/checklist' },
        { label: 'Recommendations', icon: <Lightbulb />, path: '/worker/recommendations' },
        { label: 'Notifications', icon: <NotificationsActive />, path: '/worker/notifications' },
      ];
    }

    if (userRole === 'admin') {
      return [
        ...commonItems,
        { label: 'Workers', icon: <People />, path: '/admin/workers' },
        { label: 'Worker Details', icon: <Person />, path: '/admin/worker-details' },
        { label: 'Live Map', icon: <Map />, path: '/admin/live-map' },
        { label: 'Hazards', icon: <Warning />, path: '/admin/hazards' },
        { label: 'SOS Center', icon: <Emergency />, path: '/admin/sos-center' },
        { label: 'Reports', icon: <Assessment />, path: '/admin/reports' },
        { label: 'Settings', icon: <Settings />, path: '/admin/settings' },
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
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Safety App</h2>
        <IconButton onClick={() => setMobileOpen(false)} sx={{ display: { md: 'none' } }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ flex: 1, py: 2 }}>
        {menuItems.map((item) => (
          <Tooltip key={item.path} title={item.label} placement="right">
            <ListItem disablePadding>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          onClick={onThemeToggle}
          fullWidth
          variant="outlined"
          sx={{ mb: 1 }}
          startIcon={isDarkMode ? <Brightness7 /> : <Brightness4 />}
        >
          {isDarkMode ? 'Light' : 'Dark'} Mode
        </Button>
        <Button
          onClick={onLogout}
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<Logout />}
        >
          Logout
        </Button>
      </Box>

    </Box>
  );

  return (
    <>
      <IconButton
        onClick={() => setMobileOpen(!mobileOpen)}
        sx={{ display: { md: 'none' }, position: 'fixed', top: 16, left: 16, zIndex: 1200 }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ width: 250 }}>{drawerContent}</Box>
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            mt: 0,
          },
        }}
      >
        <Box sx={{ width: 280 }}>{drawerContent}</Box>
      </Drawer>
    </>
  );
};
