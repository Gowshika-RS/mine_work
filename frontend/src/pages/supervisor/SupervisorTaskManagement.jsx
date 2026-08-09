import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip, LinearProgress, Stack, MenuItem, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer } from '@mui/material';
import { Add, Assignment, CheckCircle, AccessTime, Warning, Refresh } from '@mui/icons-material';
import apiClient from '../../api/client';

export const SupervisorTaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    task_name: '', worker_id: '', priority: 'medium', mine_area: '', deadline: '', safety_instructions: ''
  });

  const loadData = async () => {
    try {
      const [tRes, wRes] = await Promise.all([
        apiClient.get('/supervisor/tasks'),
        apiClient.get('/supervisor/workers')
      ]);
      setTasks(tRes.data);
      setWorkers(wRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateTask = async () => {
    if (!taskForm.task_name || !taskForm.worker_id) return;
    const worker = workers.find(w => w.id === taskForm.worker_id);
    try {
      await apiClient.post('/supervisor/tasks', {
        ...taskForm,
        worker_name: worker ? worker.full_name : 'Worker'
      });
      setOpenModal(false);
      setTaskForm({ task_name: '', worker_id: '', priority: 'medium', mine_area: '', deadline: '', safety_instructions: '' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary">Task Management</Typography>
          <Typography variant="body2" color="text.secondary">Assign daily mine operations, safety instructions & checklist tracking</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenModal(true)}>Assign New Task</Button>
      </Box>

      <Grid container spacing={3}>
        {tasks.map((t) => (
          <Grid item xs={12} md={6} lg={4} key={t.id}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Chip label={t.priority.toUpperCase()} color={t.priority === 'high' ? 'error' : t.priority === 'medium' ? 'warning' : 'info'} size="small" />
                  <Chip label={t.status.toUpperCase()} size="small" variant="outlined" />
                </Box>
                <Typography variant="h6" fontWeight={700}>{t.task_name}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">Assigned to: {t.worker_name}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">Mine Area: {t.mine_area}</Typography>

                <Box sx={{ my: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Progress</Typography>
                    <Typography variant="caption" fontWeight={700}>{t.progress}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={t.progress} sx={{ borderRadius: 2 }} />
                </Box>

                {t.safety_instructions && (
                  <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight={700} color="primary">Safety Instructions:</Typography>
                    <Typography variant="body2" color="text.secondary">{t.safety_instructions}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign New Task</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Task Name" fullWidth size="small" value={taskForm.task_name} onChange={(e) => setTaskForm({ ...taskForm, task_name: e.target.value })} />
            <TextField select label="Worker" fullWidth size="small" value={taskForm.worker_id} onChange={(e) => setTaskForm({ ...taskForm, worker_id: e.target.value })}>
              {workers.map((w) => <MenuItem key={w.id} value={w.id}>{w.full_name} ({w.employee_id})</MenuItem>)}
            </TextField>
            <TextField select label="Priority" fullWidth size="small" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
            <TextField label="Mine Area" fullWidth size="small" value={taskForm.mine_area} onChange={(e) => setTaskForm({ ...taskForm, mine_area: e.target.value })} />
            <TextField label="Deadline" type="date" InputLabelProps={{ shrink: true }} fullWidth size="small" value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })} />
            <TextField label="Safety Instructions" multiline rows={2} fullWidth size="small" value={taskForm.safety_instructions} onChange={(e) => setTaskForm({ ...taskForm, safety_instructions: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTask}>Assign Task</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
