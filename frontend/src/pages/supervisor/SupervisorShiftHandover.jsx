import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Schedule as ShiftIcon, Add as AddIcon, AssignmentTurnedIn as HandoverIcon } from '@mui/icons-material';
import apiClient from '../../api/client';

export default function SupervisorShiftHandover() {
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const [form, setForm] = useState({
    shift_name: 'Morning Shift',
    workers_on_shift: 25,
    open_hazards_count: 1,
    open_equipment_count: 0,
    open_incidents_count: 0,
    important_notes: 'All personnel checked out cleanly. Geotechnical mesh monitored at Shaft 2.',
    next_shift_recommendations: 'Maintain ventilation speed at 100% in Sector B.'
  });

  useEffect(() => {
    fetchHandovers();
  }, []);

  const fetchHandovers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/supervisor/shift-handovers');
      setHandovers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch shift handovers:', err);
      setError('Could not load shift handover records.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHandover = async () => {
    try {
      await apiClient.post('/supervisor/shift-handover', form);
      setOpenDialog(false);
      fetchHandovers();
    } catch (err) {
      console.error('Failed to log handover:', err);
    }
  };

  return (
    <Box sx={{ py: 2, maxWidth: 1100, mx: 'auto' }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          border: '1px solid #334155'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <ShiftIcon sx={{ fontSize: 36, color: '#f59e0b' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Shift Handover Operations Log
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Log shift safety summary, open hazards, personnel status, and recommendations for incoming supervisors
              </Typography>
            </Box>
          </Box>

          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)} sx={{ bgcolor: '#d97706' }}>
            Log New Shift Handover
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#1e293b' }}>
                <TableRow>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Date & Shift</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Supervisor</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Workers</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Open Hazards / Equipment</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Important Notes</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Next Shift Instructions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {handovers.length > 0 ? (
                  handovers.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="#fff">{row.shift_name}</Typography>
                        <Typography variant="caption" color="#94a3b8">{row.handover_date}</Typography>
                      </TableCell>
                      <TableCell sx={{ color: '#38bdf8' }}>{row.supervisor_name}</TableCell>
                      <TableCell sx={{ color: '#4ade80', fontWeight: 'bold' }}>{row.workers_on_shift} Workers</TableCell>
                      <TableCell sx={{ color: '#facc15' }}>
                        {row.open_hazards_count} Hazard(s) | {row.open_equipment_count} Equipment
                      </TableCell>
                      <TableCell sx={{ color: '#cbd5e1', maxWidth: 220 }}>{row.important_notes}</TableCell>
                      <TableCell sx={{ color: '#38bdf8', maxWidth: 220 }}>{row.next_shift_recommendations}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: '#94a3b8', py: 3 }}>
                      No shift handovers logged yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Log Handover Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{ sx: { bgcolor: '#0f172a', color: '#fff', border: '1px solid #334155' } }}>
        <DialogTitle>Log Shift Handover Report</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Shift Name"
            value={form.shift_name}
            onChange={(e) => setForm({ ...form, shift_name: e.target.value })}
            sx={{ mt: 2, bgcolor: '#1e293b', borderRadius: 1, input: { color: '#fff' } }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Important Notes & Observations"
            value={form.important_notes}
            onChange={(e) => setForm({ ...form, important_notes: e.target.value })}
            sx={{ mt: 2, bgcolor: '#1e293b', borderRadius: 1, textarea: { color: '#fff' } }}
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Recommendations for Next Shift"
            value={form.next_shift_recommendations}
            onChange={(e) => setForm({ ...form, next_shift_recommendations: e.target.value })}
            sx={{ mt: 2, bgcolor: '#1e293b', borderRadius: 1, textarea: { color: '#fff' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateHandover} sx={{ bgcolor: '#d97706' }}>Save Shift Handover</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
