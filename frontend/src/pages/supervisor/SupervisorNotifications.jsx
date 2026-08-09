import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar, Chip, Button, Divider } from '@mui/material';
import { NotificationsActive, Emergency, GasMeter, PersonOff, HealthAndSafety, Build, DoneAll } from '@mui/icons-material';
import apiClient from '../../api/client';

const getNotifIcon = (type) => {
  switch (type) {
    case 'emergency': return <Emergency sx={{ color: 'error.main' }} />;
    case 'gas': return <GasMeter sx={{ color: 'warning.main' }} />;
    case 'offline': return <PersonOff sx={{ color: 'text.secondary' }} />;
    case 'health': return <HealthAndSafety sx={{ color: 'info.main' }} />;
    default: return <NotificationsActive sx={{ color: 'primary.main' }} />;
  }
};

export const SupervisorNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await apiClient.get('/supervisor/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const handleMarkAll = async () => {
    try {
      await apiClient.post('/supervisor/notifications/read-all');
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary">Supervisor Notifications</Typography>
          <Typography variant="body2" color="text.secondary">Real-time alerts for gas leaks, offline workers & emergency triggers</Typography>
        </Box>
        <Button variant="outlined" startIcon={<DoneAll />} onClick={handleMarkAll}>Mark All as Read</Button>
      </Box>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 0 }}>
          <List sx={{ p: 0 }}>
            {notifications.length > 0 ? notifications.map((n) => (
              <ListItem key={n.id} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: n.is_read ? 'inherit' : 'action.hover' }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'background.paper' }}>{getNotifIcon(n.type)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={n.title}
                  secondary={n.message}
                  primaryTypographyProps={{ fontWeight: n.is_read ? 500 : 700 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>{n.created_at}</Typography>
              </ListItem>
            )) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No unread notifications.</Typography>
              </Box>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};
