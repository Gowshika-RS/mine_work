import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Chip, Button, CircularProgress, Alert } from '@mui/material';
import { NotificationsActive, Error, Info, Check } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import apiClient from '../../api/client';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Could not fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'safety_alert':
      case 'hazard_warning':
        return <NotificationsActive sx={{ color: 'warning.main' }} />;
      case 'error':
        return <Error sx={{ color: 'error.main' }} />;
      case 'success':
        return <Check sx={{ color: 'success.main' }} />;
      default:
        return <Info sx={{ color: 'info.main' }} />;
    }
  };

  const handleClear = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      // Update local state by filtering or setting read flag
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleReadAll = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications([]);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Filter only unread notifications to present a clean, actionable view
  const unreadNotifications = notifications.filter(n => !n.is_read);

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Notifications Center
        </Typography>
        {unreadNotifications.length > 0 && (
          <Button onClick={handleReadAll} variant="outlined" size="small">
            Mark all as read
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent sx={{ p: 2 }}>
          <List sx={{ width: '100%', p: 0 }}>
            {unreadNotifications.length === 0 ? (
              <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                No new notifications
              </Typography>
            ) : (
              unreadNotifications.map((notif) => (
                <ListItem
                  key={notif.id}
                  sx={{
                    mb: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    p: 2,
                    '&:last-child': { mb: 0 }
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                    <Box sx={{ mt: 0.5 }}>{getIcon(notif.type)}</Box>
                    <ListItemText
                      primary={notif.title}
                      secondaryTypographyProps={{ component: 'div' }}
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                            {notif.message}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                            {new Date(notif.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                  <Button
                    size="small"
                    variant="text"
                    color="primary"
                    onClick={() => handleClear(notif.id)}
                  >
                    Dismiss
                  </Button>
                </ListItem>
              ))
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};
