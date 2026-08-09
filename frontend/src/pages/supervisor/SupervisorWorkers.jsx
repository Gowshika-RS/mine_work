import { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress, Alert, Chip,
  Avatar, Button, TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Stack, Divider
} from '@mui/material';
import { Search, Person, Assignment, LocationOn, Chat, Phone, Refresh, Close } from '@mui/icons-material';
import { motion } from 'framer-motion';
import apiClient from '../../api/client';
import { useNavigate } from 'react-router-dom';

const getRiskColor = (risk) => {
  switch (risk) {
    case 'High Risk': return '#f44336';
    case 'Medium Risk': return '#ff9800';
    default: return '#4caf50';
  }
};

export const SupervisorWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [profileModal, setProfileModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ task_name: '', priority: 'medium', mine_area: '', deadline: '', safety_instructions: '' });
  const navigate = useNavigate();

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/supervisor/workers');
      setWorkers(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load assigned workers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorkers(); }, [fetchWorkers]);

  const handleOpenProfile = (w) => {
    setSelectedWorker(w);
    setProfileModal(true);
  };

  const handleAssignTaskSubmit = async () => {
    if (!taskForm.task_name) return;
    try {
      await apiClient.post('/supervisor/tasks', {
        ...taskForm,
        worker_id: selectedWorker.id,
        worker_name: selectedWorker.full_name,
      });
      setTaskModal(false);
      setTaskForm({ task_name: '', priority: 'medium', mine_area: '', deadline: '', safety_instructions: '' });
    } catch (err) {
      setError('Failed to assign task');
    }
  };

  const filteredWorkers = workers.filter(w =>
    w.full_name.toLowerCase().includes(search.toLowerCase()) ||
    w.employee_id.toLowerCase().includes(search.toLowerCase()) ||
    w.department.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary">Assigned Workers</Typography>
          <Typography variant="body2" color="text.secondary">Real-time status, productivity scores & risk indicators</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search Employee ID, Name, Department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
          />
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchWorkers}>Refresh</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {filteredWorkers.map((w, idx) => (
          <Grid item xs={12} md={6} lg={4} key={w.id}>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
              <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'action.hover' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: getRiskColor(w.risk_status), fontWeight: 700 }}>
                      {w.full_name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>{w.full_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{w.employee_id} • {w.department}</Typography>
                    </Box>
                  </Box>
                  <Chip label={w.is_active ? 'ONLINE' : 'OFFLINE'} color={w.is_active ? 'success' : 'default'} size="small" sx={{ fontWeight: 700, fontSize: 10 }} />
                </Box>

                <Divider />

                <CardContent sx={{ py: 2 }}>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Productivity Score:</Typography>
                      <Chip label={`${w.productivity_score}/100`} color={w.productivity_score >= 75 ? 'success' : 'warning'} size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Risk Status:</Typography>
                      <Chip label={w.risk_status} size="small" sx={{ bgcolor: getRiskColor(w.risk_status), color: 'white', fontWeight: 700 }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Current Shift:</Typography>
                      <Typography variant="caption" fontWeight={600}>{w.current_shift}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Assigned Task:</Typography>
                      <Typography variant="caption" fontWeight={600}>{w.assigned_task} ({w.task_status})</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Checklist Status:</Typography>
                      <Typography variant="caption" fontWeight={600} color={w.checklist_status === 'COMPLETED' ? 'success.main' : 'warning.main'}>
                        {w.checklist_status}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Last Active Time:</Typography>
                      <Typography variant="caption" color="text.secondary">{w.last_active_time}</Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={1}>
                    <Grid item xs={4}><Button fullWidth size="small" variant="outlined" startIcon={<Person />} onClick={() => handleOpenProfile(w)}>Details</Button></Grid>
                    <Grid item xs={4}><Button fullWidth size="small" variant="outlined" startIcon={<Assignment />} onClick={() => { setSelectedWorker(w); setTaskModal(true); }}>Task</Button></Grid>
                    <Grid item xs={4}><Button fullWidth size="small" variant="outlined" startIcon={<LocationOn />} onClick={() => navigate('/supervisor/live-tracking')}>Track</Button></Grid>
                    <Grid item xs={6}><Button fullWidth size="small" variant="outlined" startIcon={<Chat />} onClick={() => navigate('/supervisor/communication')}>Message</Button></Grid>
                    <Grid item xs={6}><Button fullWidth size="small" color="error" variant="outlined" startIcon={<Phone />} onClick={() => alert(`Calling ${w.full_name}: ${w.phone_number}`)}>Call</Button></Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Details Dialog */}
      <Dialog open={profileModal} onClose={() => setProfileModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Worker Details
          <IconButton onClick={() => setProfileModal(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedWorker && (
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 24 }}>{selectedWorker.full_name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>{selectedWorker.full_name}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedWorker.employee_id} • {selectedWorker.designation}</Typography>
                </Box>
              </Box>
              <Divider />
              <Grid container spacing={2}>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Department</Typography><Typography variant="body2" fontWeight={600}>{selectedWorker.department}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Assigned Mine</Typography><Typography variant="body2" fontWeight={600}>{selectedWorker.mine_location}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Phone Number</Typography><Typography variant="body2" fontWeight={600}>{selectedWorker.phone_number}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Emergency Contact</Typography><Typography variant="body2" fontWeight={600}>{selectedWorker.emergency_contact_name} ({selectedWorker.emergency_contact_number})</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Productivity Score</Typography><Typography variant="body2" fontWeight={600}>{selectedWorker.productivity_score}/100</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Risk Indicator</Typography><Typography variant="body2" fontWeight={600} color={getRiskColor(selectedWorker.risk_status)}>{selectedWorker.risk_status}</Typography></Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
