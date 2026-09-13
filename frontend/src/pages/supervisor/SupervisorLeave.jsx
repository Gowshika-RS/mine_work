import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Button, Alert, CircularProgress,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Tabs, Tab, Container, Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AddIcon from '@mui/icons-material/Add';
import EventNoteIcon from '@mui/icons-material/EventNote';
import apiClient from '../../api/client';

export const SupervisorLeave = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Apply Leave Modal State
  const [openModal, setOpenModal] = useState(false);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/leave-requests');
      setRequests(response.data);
    } catch (err) {
      try {
        const fallback = await apiClient.get('/supervisor/leave-requests');
        setRequests(fallback.data);
      } catch (e) {
        setError(err.response?.data?.detail || 'Unable to load leave requests');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try {
      setError('');
      await apiClient.post(`/leave-requests/${id}/approve`);
      setSuccessMsg(`Leave request #${id} approved.`);
      await load();
    } catch (err) {
      try {
        await apiClient.post(`/supervisor/leave-requests/${id}/approve`);
        setSuccessMsg(`Leave request #${id} approved.`);
        await load();
      } catch (e) {
        setError(err.response?.data?.detail || 'Unable to approve leave');
      }
    }
  };

  const reject = async (id) => {
    try {
      setError('');
      await apiClient.post(`/leave-requests/${id}/reject`);
      setSuccessMsg(`Leave request #${id} rejected.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to reject leave');
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!reason || !startDate || !endDate) return;

    try {
      setError('');
      await apiClient.post('/leave-requests', {
        reason,
        start_date: startDate,
        end_date: endDate
      });
      setSuccessMsg("Supervisor leave request submitted to Admin!");
      setOpenModal(false);
      setReason('');
      setStartDate('');
      setEndDate('');
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit leave request');
    }
  };

  const getStatusChip = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'approved') return <Chip icon={<CheckCircleIcon />} label="Approved" color="success" size="small" sx={{ fontWeight: 'bold' }} />;
    if (s === 'rejected') return <Chip icon={<CancelIcon />} label="Rejected" color="error" size="small" sx={{ fontWeight: 'bold' }} />;
    return <Chip icon={<HourglassEmptyIcon />} label="Pending" color="warning" size="small" sx={{ fontWeight: 'bold' }} />;
  };

  const filteredRequests = requests.filter(r => {
    const status = (r.status || 'pending').toLowerCase();
    if (tabValue === 1) return status === 'pending';
    if (tabValue === 2) return status === 'approved';
    if (tabValue === 3) return status === 'rejected';
    return true;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <EventNoteIcon sx={{ fontSize: 36, color: '#0288d1' }} />
          <Box>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              Leave Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review team leave requests and submit supervisor leave applications
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ bgcolor: '#0288d1', borderRadius: 2, px: 3 }}
        >
          Apply Supervisor Leave
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)} indicatorColor="primary" textColor="primary">
          <Tab label={`All (${requests.length})`} />
          <Tab label={`Pending (${requests.filter(r => (r.status||'pending').toLowerCase() === 'pending').length})`} />
          <Tab label={`Approved (${requests.filter(r => (r.status||'').toLowerCase() === 'approved').length})`} />
          <Tab label={`Rejected (${requests.filter(r => (r.status||'').toLowerCase() === 'rejected').length})`} />
        </Tabs>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell fontWeight={700}>Request ID</TableCell>
              <TableCell fontWeight={700}>Applicant</TableCell>
              <TableCell fontWeight={700}>Role</TableCell>
              <TableCell fontWeight={700}>Reason</TableCell>
              <TableCell fontWeight={700}>Dates</TableCell>
              <TableCell fontWeight={700}>Status</TableCell>
              <TableCell fontWeight={700}>Reviewer</TableCell>
              <TableCell fontWeight={700} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell>
              </TableRow>
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No leave requests found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>#{request.id}</TableCell>
                  <TableCell fontWeight={600}>{request.worker_name || `User #${request.worker_id}`}</TableCell>
                  <TableCell><Chip label={(request.worker_role || 'worker').toUpperCase()} size="small" variant="outlined" /></TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>{request.start_date} → {request.end_date}</TableCell>
                  <TableCell>{getStatusChip(request.status)}</TableCell>
                  <TableCell>{request.reviewer_name || '—'}</TableCell>
                  <TableCell align="right">
                    {(request.status || 'pending').toLowerCase() === 'pending' ? (
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Button variant="contained" color="success" size="small" onClick={() => approve(request.id)}>
                          Approve
                        </Button>
                        <Button variant="outlined" color="error" size="small" onClick={() => reject(request.id)}>
                          Reject
                        </Button>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">Completed</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Apply Leave Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Submit Supervisor Leave Application</DialogTitle>
        <form onSubmit={handleApplyLeave}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Reason for Leave"
                  fullWidth
                  multiline
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State reason for supervisor absence and designated delegate..."
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#0288d1' }}>
              Submit Application
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};
