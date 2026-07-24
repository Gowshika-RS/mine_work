import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  NotificationsActive,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle,
  MarkEmailRead,
  Delete,
  Refresh,
  Campaign,
} from '@mui/icons-material';
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/client';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0); // 0: All, 1: Unread, 2: Read

  const fetchNotifications = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/notifications');
      setNotifications(response.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      if (!isSilent) setError('Unable to load notifications. Please check your connection.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Setup auto-refresh polling interval (every 5 seconds) for real-time announcements
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getPriorityColor = (priority, type) => {
    if (priority === 'emergency' || type === 'emergency_instruction') return 'error';
    if (priority === 'critical') return 'error';
    if (priority === 'warning' || type === 'hazard_warning') return 'warning';
    return 'info';
  };

  const getPriorityLabel = (priority, type) => {
    if (priority === 'emergency' || type === 'emergency_instruction') return 'EMERGENCY';
    if (priority === 'critical') return 'CRITICAL';
    if (priority === 'warning' || type === 'hazard_warning') return 'WARNING';
    return 'INFO';
  };

  const getIcon = (type, priority) => {
    if (priority === 'emergency' || type === 'emergency_instruction') {
      return <ErrorIcon sx={{ color: 'error.main', fontSize: 28 }} />;
    }
    if (priority === 'warning' || type === 'hazard_warning') {
      return <NotificationsActive sx={{ color: 'warning.main', fontSize: 28 }} />;
    }
    if (type === 'safety_alert') {
      return <Campaign sx={{ color: 'primary.main', fontSize: 28 }} />;
    }
    return <InfoIcon sx={{ color: 'info.main', fontSize: 28 }} />;
  };

  // Filter list by tab
  const filteredNotifications = notifications.filter((n) => {
    if (tabValue === 1) return !n.is_read;
    if (tabValue === 2) return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={44} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Announcements & Safety Notifications
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Real-time safety directives, hazard alerts, and site announcements from Mine Control
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Refresh List">
            <IconButton onClick={() => fetchNotifications()} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="contained" size="small" startIcon={<CheckCircle />}>
              Mark all read ({unreadCount})
            </Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={`All Notices (${notifications.length})`} />
          <Tab label={`Unread (${unreadCount})`} />
          <Tab label={`Read (${notifications.length - unreadCount})`} />
        </Tabs>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent sx={{ p: 2 }}>
          <List sx={{ width: '100%', p: 0 }}>
            {filteredNotifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <InfoIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="textSecondary" variant="h6">
                  {tabValue === 1 ? 'No unread notifications' : 'No notifications available'}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  New announcements and safety alerts sent by Mine Control will appear here automatically.
                </Typography>
              </Box>
            ) : (
              filteredNotifications.map((notif) => (
                <ListItem
                  key={notif.id}
                  sx={{
                    mb: 1.5,
                    border: '1px solid',
                    borderColor: notif.is_read ? 'divider' : 'primary.main',
                    bgcolor: notif.is_read ? 'background.paper' : 'action.hover',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'flex-start' },
                    p: 2,
                    gap: 2,
                    '&:last-child': { mb: 0 },
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                    <Box sx={{ mt: 0.5 }}>{getIcon(notif.type, notif.priority)}</Box>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                            {notif.title}
                          </Typography>
                          <Chip
                            label={getPriorityLabel(notif.priority, notif.type)}
                            color={getPriorityColor(notif.priority, notif.type)}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                          />
                          <Chip
                            label={notif.category || 'Announcement'}
                            variant="outlined"
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                          {!notif.is_read && (
                            <Chip label="NEW" color="primary" size="small" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                          )}
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.6, mb: 1 }}>
                            {notif.message}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                            Received: {new Date(notif.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                    {!notif.is_read && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<MarkEmailRead />}
                        onClick={() => handleMarkAsRead(notif.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                    <IconButton size="small" color="error" title="Delete Notice" onClick={() => handleDelete(notif.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
              ))
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};
