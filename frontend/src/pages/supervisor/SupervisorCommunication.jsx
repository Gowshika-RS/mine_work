import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, TextField, Button, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, Stack, IconButton, Chip } from '@mui/material';
import { Send, Campaign, Mic, RecordVoiceOver, CheckCircle, DoneAll } from '@mui/icons-material';
import apiClient from '../../api/client';

export const SupervisorCommunication = () => {
  const [conversations, setConversations] = useState([]);
  const [activeWorker, setActiveWorker] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [broadcastMode, setBroadcastMode] = useState(false);

  const loadConversations = async () => {
    try {
      const res = await apiClient.get('/supervisor/conversations');
      setConversations(res.data);
      if (res.data.length > 0 && !activeWorker) {
        setActiveWorker(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = async (workerId) => {
    try {
      const res = await apiClient.get(`/supervisor/messages?worker_id=${workerId}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (activeWorker && !broadcastMode) {
      loadMessages(activeWorker.worker_id);
    }
  }, [activeWorker, broadcastMode]);

  const handleSend = async () => {
    if (!inputMsg) return;
    try {
      if (broadcastMode) {
        await apiClient.post('/supervisor/messages', {
          group_target: 'workers',
          message_type: 'announcement',
          content: inputMsg,
        });
      } else {
        await apiClient.post('/supervisor/messages', {
          receiver_id: activeWorker.worker_id,
          message_type: 'direct',
          content: inputMsg,
        });
        loadMessages(activeWorker.worker_id);
      }
      setInputMsg('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary">Communication Hub</Typography>
          <Typography variant="body2" color="text.secondary">1-to-1 dispatch messaging, emergency broadcast & voice notes</Typography>
        </Box>
        <Button
          variant={broadcastMode ? 'contained' : 'outlined'}
          color="warning"
          startIcon={<Campaign />}
          onClick={() => setBroadcastMode(!broadcastMode)}
        >
          {broadcastMode ? 'Exit Broadcast Mode' : 'Broadcast Message'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Workers List Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 600, borderRadius: 3, border: '1px solid', borderColor: 'divider', overflowY: 'auto' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                <Typography variant="subtitle1" fontWeight={700}>Conversations</Typography>
              </Box>
              <Divider />
              <List sx={{ p: 0 }}>
                {conversations.map((c) => (
                  <ListItem
                    key={c.worker_id}
                    button
                    selected={!broadcastMode && activeWorker?.worker_id === c.worker_id}
                    onClick={() => { setBroadcastMode(false); setActiveWorker(c); }}
                    sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>{c.worker_name.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={c.worker_name}
                      secondary={c.last_message || 'No messages yet'}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                      secondaryTypographyProps={{ noWrap: true, fontSize: 12 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Chat Thread Panel */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 600, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 2, bgcolor: broadcastMode ? 'warning.lighter' : 'action.hover', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: broadcastMode ? 'warning.main' : 'primary.main' }}>
                {broadcastMode ? <Campaign /> : activeWorker?.worker_name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {broadcastMode ? 'BROADCAST TO ALL WORKERS' : activeWorker?.worker_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {broadcastMode ? 'Sends high-priority message to all active shifts' : `${activeWorker?.employee_id} • ${activeWorker?.department}`}
                </Typography>
              </Box>
            </Box>

            {/* Chat Body */}
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {!broadcastMode ? (
                messages.map((m) => (
                  <Box
                    key={m.id}
                    sx={{
                      alignSelf: m.is_mine ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: m.is_mine ? 'primary.main' : 'action.selected',
                      color: m.is_mine ? 'white' : 'text.primary',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5, opacity: 0.9, color: m.is_mine ? '#e3f2fd' : 'primary.main' }}>
                      {m.sender_name || (m.is_mine ? 'Supervisor (Supervisor)' : `${activeWorker?.worker_name} (Worker)`)}
                    </Typography>
                    <Typography variant="body2">{m.content}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Typography variant="caption" sx={{ fontSize: 10, opacity: 0.8 }}>{m.created_at}</Typography>
                      {m.is_mine && <DoneAll sx={{ fontSize: 12, opacity: 0.8 }} />}
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Campaign sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h6" fontWeight={700}>Broadcast Mode Active</Typography>
                  <Typography variant="body2" color="text.secondary">Your message will be sent as an alert popup to all online miners.</Typography>
                </Box>
              )}
            </Box>

            {/* Input Bar */}
            <Divider />
            <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                placeholder={broadcastMode ? 'Type broadcast message...' : 'Type message to worker...'}
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button variant="contained" color={broadcastMode ? 'warning' : 'primary'} endIcon={<Send />} onClick={handleSend}>
                Send
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
