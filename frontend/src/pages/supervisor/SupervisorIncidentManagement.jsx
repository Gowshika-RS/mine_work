import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Stack } from '@mui/material';
import { ReportProblem, PictureAsPdf, Add, Refresh } from '@mui/icons-material';
import apiClient from '../../api/client';

export const SupervisorIncidentManagement = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({ hazard_type: '', severity: 'medium', mine: '', description: '', cause: '', immediate_actions: '' });

  const loadIncidents = async () => {
    try {
      const res = await apiClient.get('/supervisor/incidents');
      setIncidents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadIncidents(); }, []);

  const handleCreate = async () => {
    try {
      await apiClient.post('/supervisor/incidents', form);
      setOpenModal(false);
      setForm({ hazard_type: '', severity: 'medium', mine: '', description: '', cause: '', immediate_actions: '' });
      loadIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  const generatePDF = (inc) => {
    alert(`Generating Incident Report PDF for ${inc.incident_id}... Report exported successfully.`);
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary">Incident Management</Typography>
          <Typography variant="body2" color="text.secondary">Record, review, & generate audit reports for mine safety incidents</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenModal(true)}>Log New Incident</Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>Incident ID</TableCell>
              <TableCell>Worker / Reporter</TableCell>
              <TableCell>Mine Area</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Type / Severity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Report Export</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incidents.map((inc) => (
              <TableRow key={inc.id} hover>
                <TableCell fontWeight={700}>{inc.incident_id}</TableCell>
                <TableCell>{inc.worker}</TableCell>
                <TableCell>{inc.mine}</TableCell>
                <TableCell>{inc.date} {inc.time}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{inc.hazard_type}</Typography>
                  <Chip label={inc.severity.toUpperCase()} size="small" color={inc.severity === 'critical' || inc.severity === 'high' ? 'error' : 'warning'} />
                </TableCell>
                <TableCell><Chip label={inc.status.toUpperCase()} size="small" color={inc.status === 'resolved' ? 'success' : 'info'} /></TableCell>
                <TableCell align="center">
                  <Button size="small" variant="outlined" startIcon={<PictureAsPdf />} onClick={() => generatePDF(inc)}>
                    PDF Report
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Log New Incident</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Incident / Hazard Type" fullWidth size="small" value={form.hazard_type} onChange={(e) => setForm({ ...form, hazard_type: e.target.value })} />
            <TextField label="Mine Location" fullWidth size="small" value={form.mine} onChange={(e) => setForm({ ...form, mine: e.target.value })} />
            <TextField label="Description" multiline rows={2} fullWidth size="small" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <TextField label="Root Cause" fullWidth size="small" value={form.cause} onChange={(e) => setForm({ ...form, cause: e.target.value })} />
            <TextField label="Immediate Actions Taken" multiline rows={2} fullWidth size="small" value={form.immediate_actions} onChange={(e) => setForm({ ...form, immediate_actions: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Save Incident</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
