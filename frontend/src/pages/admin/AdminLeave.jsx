import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, Tabs, Tab, TextField,
  MenuItem, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import apiClient from '../../api/client';

export const AdminLeave = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [roleFilter, setRoleFilter] = useState('ALL');

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
      setSuccessMsg(`Leave request #${id} approved successfully.`);
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
      setSuccessMsg("Admin leave request logged.");
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

  const getRoleChip = (role) => {
    const r = (role || 'worker').toLowerCase();
    let color = 'default';
    if (r === 'admin') color = 'error';
    else if (r === 'supervisor') color = 'primary';
    else if (r === 'emergency_officer') color = 'secondary';
    return <Chip label={r.replace('_', ' ').toUpperCase()} size="small" color={color} variant="outlined" sx={{ fontWeight: 700 }} />;
  };

  const filteredRequests = requests.filter(r => {
    const status = (r.status || 'pending').toLowerCase();
    const roleMatches = roleFilter === 'ALL' || (r.worker_role || 'worker').toLowerCase() === roleFilter.toLowerCase();
    
    if (!roleMatches) return false;
    if (tabValue === 1) return status === 'pending';
    if (tabValue === 2) return status === 'approved';
    if (tabValue === 3) return status === 'rejected';
    return true;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <EventNoteIcon sx={{ fontSize: 36, color: '#dc2626' }} />
          <Box>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              Site-Wide Leave Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Central executive oversight for worker, supervisor, and emergency officer leave requests
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ bgcolor: '#dc2626', hover: { bgcolor: '#b91c1c' }, borderRadius: 2, px: 3 }}
        >
          Submit Executive Leave
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>}

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, borderLeft: '6px solid #0288d1' }}>
            <CardContent>
              <Typography color="text.secondary" variant="caption" fontWeight={700}>TOTAL REQUESTS</Typography>
              <Typography variant="h4" fontWeight={800} color="#0288d1">{requests.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, borderLeft: '6px solid #eab308' }}>
            <CardContent>
              <Typography color="text.secondary" variant="caption" fontWeight={700}>PENDING APPROVAL</Typography>
              <Typography variant="h4" fontWeight={800} color="#eab308">
                {requests.filter(r => (r.status||'pending').toLowerCase() === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, borderLeft: '6px solid #22c55e' }}>
            <CardContent>
              <Typography color="text.secondary" variant="caption" fontWeight={700}>APPROVED LEAVES</Typography>
              <Typography variant="h4" fontWeight={800} color="#22c55e">
                {requests.filter(r => (r.status||'').toLowerCase() === 'approved').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, borderLeft: '6px solid #ef4444' }}>
            <CardContent>
              <Typography color="text.secondary" variant="caption" fontWeight={700}>REJECTED LEAVES</Typography>
              <Typography variant="h4" fontWeight={800} color="#ef4444">
                {requests.filter(r => (r.status||'').toLowerCase() === 'rejected').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)} indicatorColor="primary" textColor="primary">
          <Tab label={`All (${requests.length})`} />
          <Tab label={`Pending (${requests.filter(r => (r.status||'pending').toLowerCase() === 'pending').length})`} />
          <Tab label={`Approved (${requests.filter(r => (r.status||'').toLowerCase() === 'approved').length})`} />
          <Tab label={`Rejected (${requests.filter(r => (r.status||'').toLowerCase() === 'rejected').length})`} />
        </Tabs>

        <TextField
          select
          size="small"
          label="Filter by Role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          sx={{ minWidth: 180 }}
          InputProps={{ startAdornment: <FilterListIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }}
        >
          <MenuItem value="ALL">All Roles</MenuItem>
          <MenuItem value="worker">Workers</MenuItem>
          <MenuItem value="supervisor">Supervisors</MenuItem>
          <MenuItem value="emergency_officer">Emergency Officers</MenuItem>
          <MenuItem value="admin">Admins</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell fontWeight={700}>Request ID</TableCell>
              <TableCell fontWeight={700}>Applicant</TableCell>
              <TableCell fontWeight={700}>Role</TableCell>
              <TableCell fontWeight={700}>Department</TableCell>
              <TableCell fontWeight={700}>Reason</TableCell>
              <TableCell fontWeight={700}>Dates</TableCell>
              <TableCell fontWeight={700}>Status</TableCell>
              <TableCell fontWeight={700}>Reviewed By</TableCell>
              <TableCell fontWeight={700} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell>
              </TableRow>
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No leave requests found matching filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>#{row.id}</TableCell>
                  <TableCell fontWeight={600}>{row.worker_name || `User #${row.worker_id}`}</TableCell>
                  <TableCell>{getRoleChip(row.worker_role)}</TableCell>
                  <TableCell>{row.department || 'Operations'}</TableCell>
                  <TableCell sx={{ maxWidth: 220 }}>{row.reason}</TableCell>
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

      {/* Apply Leave Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Submit Executive Leave Application</DialogTitle>
        <form onSubmit={handleApplyLeave}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Reason for Executive Leave"
                  fullWidth
                  multiline
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Specify absence rationale and acting command authority..."
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
            <Button type="submit" variant="contained" sx={{ bgcolor: '#dc2626' }}>
              Log Executive Leave
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default AdminLeave;
