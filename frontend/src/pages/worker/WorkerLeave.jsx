import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Grid, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, Card, CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../../api/client';

export const WorkerLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/leave-requests/my');
      setLeaves(res.data);
    } catch (err) {
      console.error("Failed to load leaves:", err);
      // Fallback if /leave-requests/my returns 404
      try {
        const res2 = await apiClient.get('/leave-requests');
        setLeaves(res2.data);
      } catch (e) {
        setError("Unable to load leave requests");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !startDate || !endDate) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      setError(null);
      await apiClient.post('/leave-requests', {
        reason,
        start_date: startDate,
        end_date: endDate
      });
      setSuccessMsg("Leave request submitted successfully!");
      setOpenModal(false);
      setReason('');
      setStartDate('');
      setEndDate('');
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit leave request.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this leave request?")) return;
    try {
      await apiClient.delete(`/leave-requests/${id}`);
      setSuccessMsg("Leave request cancelled.");
      fetchLeaves();
    } catch (err) {
      setError("Failed to cancel leave request.");
    }
  };

  const getStatusChip = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'approved') {
      return <Chip icon={<CheckCircleIcon />} label="Approved" color="success" size="small" sx={{ fontWeight: 'bold' }} />;
    }
    if (s === 'rejected') {
      return <Chip icon={<CancelIcon />} label="Rejected" color="error" size="small" sx={{ fontWeight: 'bold' }} />;
    }
    return <Chip icon={<HourglassEmptyIcon />} label="Pending Approval" color="warning" size="small" sx={{ fontWeight: 'bold' }} />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <EventNoteIcon sx={{ fontSize: 36, color: '#0288d1' }} />
          <Box>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              My Leave Requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Submit and track your shift leave applications
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ bgcolor: '#0288d1', hover: { bgcolor: '#01579b' }, borderRadius: 2, px: 3 }}
        >
          Apply for Leave
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, borderLeft: '6px solid #eab308' }}>
            <CardContent>
              <Typography color="text.secondary" variant="caption" fontWeight={700}>PENDING APPROVAL</Typography>
              <Typography variant="h4" fontWeight={800} color="#eab308">
                {leaves.filter(l => (l.status || '').toLowerCase() === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, borderLeft: '6px solid #22c55e' }}>
            <CardContent>
              <Typography color="text.secondary" variant="caption" fontWeight={700}>APPROVED LEAVES</Typography>
              <Typography variant="h4" fontWeight={800} color="#22c55e">
                {leaves.filter(l => (l.status || '').toLowerCase() === 'approved').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, borderLeft: '6px solid #ef4444' }}>
            <CardContent>
              <Typography color="text.secondary" variant="caption" fontWeight={700}>REJECTED REQUESTS</Typography>
              <Typography variant="h4" fontWeight={800} color="#ef4444">
                {leaves.filter(l => (l.status || '').toLowerCase() === 'rejected').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell fontWeight={700}>Request ID</TableCell>
                <TableCell fontWeight={700}>Reason</TableCell>
                <TableCell fontWeight={700}>Start Date</TableCell>
                <TableCell fontWeight={700}>End Date</TableCell>
                <TableCell fontWeight={700}>Status</TableCell>
                <TableCell fontWeight={700}>Reviewer</TableCell>
                <TableCell fontWeight={700} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No leave requests found. Click "Apply for Leave" to create a new application.
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>#{row.id}</TableCell>
                    <TableCell fontWeight={600}>{row.reason}</TableCell>
                    <TableCell>{row.start_date}</TableCell>
                    <TableCell>{row.end_date}</TableCell>
                    <TableCell>{getStatusChip(row.status)}</TableCell>
                    <TableCell>{row.reviewer_name || '—'}</TableCell>
                    <TableCell align="right">
                      {(row.status || '').toLowerCase() === 'pending' && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(row.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Apply Leave Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Submit Leave Request</DialogTitle>
        <form onSubmit={handleSubmit}>
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
                  placeholder="E.g., Family emergency, medical checkup, annual vacation"
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
              Submit Request
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default WorkerLeave;
