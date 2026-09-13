import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, Tabs, Tab,
  Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AddIcon from '@mui/icons-material/Add';
import apiClient from '../../api/client';

export const EmergencyLeave = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/leave-requests');
      setRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setError(null);
      await apiClient.post(`/leave-requests/${id}/approve`);
      setSuccessMsg(`Leave request #${id} approved.`);
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to approve request.");
    }
  };

  const handleReject = async (id) => {
    try {
      setError(null);
      await apiClient.post(`/leave-requests/${id}/reject`);
      setSuccessMsg(`Leave request #${id} rejected.`);
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reject request.");
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!reason || !startDate || !endDate) return;

    try {
      setError(null);
      await apiClient.post('/leave-requests', {
        reason,
        start_date: startDate,
        end_date: endDate
      });
      setSuccessMsg("Emergency officer leave request submitted.");
      setOpenModal(false);
      setReason('');
      setStartDate('');
      setEndDate('');
      fetchLeaves();
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
          <EventNoteIcon sx={{ fontSize: 36, color: '#f59e0b' }} />
          <Box>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              Emergency Command Leave Portal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage operational personnel leave status and submit emergency officer leave
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ bgcolor: '#f59e0b', color: '#000', fontWeight: 'bold', borderRadius: 2, px: 3, '&:hover': { bgcolor: '#d97706' } }}
        >
          Apply Emergency Officer Leave
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>}

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)} indicatorColor="warning" textColor="inherit">
          <Tab label={`All (${requests.length})`} />
          <Tab label={`Pending (${requests.filter(r => (r.status||'pending').toLowerCase() === 'pending').length})`} />
          <Tab label={`Approved (${requests.filter(r => (r.status||'').toLowerCase() === 'approved').length})`} />
          <Tab label={`Rejected (${requests.filter(r => (r.status||'').toLowerCase() === 'rejected').length})`} />
        </Tabs>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#1e293b' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Request ID</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Applicant</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Reason</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Dates</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Reviewer</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Actions</TableCell>
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
              filteredRequests.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>#{row.id}</TableCell>
                  <TableCell fontWeight={600}>{row.worker_name || `User #${row.worker_id}`}</TableCell>
                  <TableCell><Chip label={(row.worker_role || 'worker').toUpperCase()} size="small" variant="outlined" /></TableCell>
                  <TableCell>{row.reason}</TableCell>
                  <TableCell>{row.start_date} → {row.end_date}</TableCell>
                  <TableCell>{getStatusChip(row.status)}</TableCell>
                  <TableCell>{row.reviewer_name || '—'}</TableCell>
                  <TableCell align="right">
                    {(row.status || 'pending').toLowerCase() === 'pending' ? (
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Button variant="contained" color="success" size="small" onClick={() => handleApprove(row.id)}>
                          Approve
                        </Button>
                        <Button variant="outlined" color="error" size="small" onClick={() => handleReject(row.id)}>
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

      {/* Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Submit Emergency Officer Leave Application</DialogTitle>
        <form onSubmit={handleApplyLeave}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Reason for Emergency Officer Leave"
                  fullWidth
                  multiline
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Specify leave reason and back-up rescue commander details..."
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
            <Button type="submit" variant="contained" sx={{ bgcolor: '#f59e0b', color: '#000', fontWeight: 'bold' }}>
              Submit Request
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};
