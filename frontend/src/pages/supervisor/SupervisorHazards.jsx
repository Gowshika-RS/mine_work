import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { ReportProblem, Refresh } from '@mui/icons-material';
import apiClient from '../../api/client';

export const SupervisorHazards = () => {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [resolveModal, setResolveModal] = useState(false);
  const [remarks, setRemarks] = useState('');

  const loadHazards = async () => {
    try {
      const res = await apiClient.get('/supervisor/hazards');
      setHazards(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHazards(); }, []);

  const handleResolveSubmit = async () => {
    try {
      await apiClient.post(`/supervisor/hazards/${selectedHazard.id}/resolve`, {
        status: 'resolved',
        remarks: remarks || 'Resolved by supervisor',
      });
      setResolveModal(false);
      setRemarks('');
      loadHazards();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary">Hazard Reports</Typography>
          <Typography variant="body2" color="text.secondary">Review worker-submitted mine hazards and record corrective actions</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={loadHazards}>Refresh Reports</Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>Reported By</TableCell>
              <TableCell>Hazard Type</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hazards.length > 0 ? hazards.map((h) => (
              <TableRow key={h.id} hover>
                <TableCell fontWeight={700}>{h.reported_by}</TableCell>
                <TableCell>{h.hazard_type}</TableCell>
                <TableCell>{h.location}</TableCell>
                <TableCell>{h.description}</TableCell>
                <TableCell><Chip label={h.severity.toUpperCase()} size="small" color={h.severity === 'high' || h.severity === 'critical' ? 'error' : 'warning'} /></TableCell>
                <TableCell><Chip label={h.status.toUpperCase()} size="small" color={h.status === 'resolved' ? 'success' : 'info'} /></TableCell>
                <TableCell align="center">
                  {h.status !== 'resolved' ? (
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button size="small" variant="contained" color="success" onClick={() => { setSelectedHazard(h); setResolveModal(true); }}>
                        Resolve
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={async () => {
                          await apiClient.post(`/supervisor/hazards/${h.id}/escalate`, {});
                          loadHazards();
                        }}
                      >
                        Escalate
                      </Button>
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.secondary">Resolved</Typography>
                  )}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={7} align="center">No hazard reports submitted.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={resolveModal} onClose={() => setResolveModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Resolve Hazard Report #{selectedHazard?.id}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2">{selectedHazard?.description}</Typography>
            <TextField label="Corrective Action Remarks" multiline rows={3} fullWidth size="small" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveModal(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleResolveSubmit}>Mark Resolved</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
