import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from '@mui/material';
import { Search, Edit, Delete, PersonAdd, Visibility, Block, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

export const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Snackbar Toast
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Form fields
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    department: '',
    mine_location: '',
    phone_number: '',
    designation: '',
    safety_score: 100,
  });

  const loadWorkers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/admin/workers');
      setWorkers(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load worker list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const profile = worker.profile || {};
      const haystack = `${worker.username} ${worker.email} ${profile.full_name} ${profile.department} ${profile.mine_location}`.toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());

      const matchesDept = departmentFilter === 'all' || profile.department === departmentFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && worker.is_active) ||
        (statusFilter === 'inactive' && !worker.is_active);

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [workers, searchTerm, departmentFilter, statusFilter]);

  const departments = useMemo(() => {
    const set = new Set();
    workers.forEach((w) => {
      if (w.profile?.department) set.add(w.profile.department);
    });
    return Array.from(set);
  }, [workers]);

  const handleOpenEdit = (worker) => {
    setSelectedWorker(worker);
    const p = worker.profile || {};
    setFormData({
      username: worker.username,
      email: worker.email,
      password: '',
      full_name: p.full_name || worker.username,
      department: p.department || 'Operations',
      mine_location: p.mine_location || 'Zone 1',
      phone_number: p.phone_number || '',
      designation: p.designation || 'Worker',
      safety_score: p.safety_score ?? 100,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await apiClient.put(`/admin/workers/${selectedWorker.id}`, {
        email: formData.email,
        full_name: formData.full_name,
        department: formData.department,
        mine_location: formData.mine_location,
        phone_number: formData.phone_number,
        designation: formData.designation,
        safety_score: Number(formData.safety_score),
      });
      setToast({ open: true, message: 'Worker updated successfully', severity: 'success' });
      setEditDialogOpen(false);
      loadWorkers();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.detail || 'Failed to update worker', severity: 'error' });
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      username: '',
      email: '',
      password: 'Password123!',
      full_name: '',
      department: 'Operations',
      mine_location: 'Zone A',
      phone_number: '',
      designation: 'Worker',
      safety_score: 100,
    });
    setAddDialogOpen(true);
  };

  const handleCreateWorker = async () => {
    try {
      await apiClient.post('/admin/users', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: 'worker',
        full_name: formData.full_name || formData.username,
        department: formData.department,
        mine_location: formData.mine_location,
        phone_number: formData.phone_number,
        designation: formData.designation,
      });
      setToast({ open: true, message: 'Worker created successfully', severity: 'success' });
      setAddDialogOpen(false);
      loadWorkers();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.detail || 'Failed to create worker', severity: 'error' });
    }
  };

  const handleToggleStatus = async (worker) => {
    try {
      const newStatus = !worker.is_active;
      await apiClient.put(`/admin/workers/${worker.id}/status?is_active=${newStatus}`);
      setToast({
        open: true,
        message: `Worker account ${newStatus ? 'activated' : 'deactivated'}`,
        severity: 'success',
      });
      loadWorkers();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.detail || 'Unable to update status', severity: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedWorker) return;
    try {
      await apiClient.delete(`/admin/workers/${selectedWorker.id}`);
      setToast({ open: true, message: 'Worker account deleted', severity: 'success' });
      setDeleteDialogOpen(false);
      loadWorkers();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.detail || 'Failed to delete worker', severity: 'error' });
    }
  };

  const navigate = useNavigate();

  if (loading) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={44} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Worker Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Monitor accounts, profiles, safety scores, and employment records
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAdd />} onClick={handleOpenAdd}>
          Add New Worker
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Filters Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 260 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search worker by name, ID, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                label="Department"
              >
                <MenuItem value="all">All Departments</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Workers Data Table */}
      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
            <TableRow>
              <TableCell>Worker Profile</TableCell>
              <TableCell>Contact & Email</TableCell>
              <TableCell>Department & Zone</TableCell>
              <TableCell>Status</TableCell>

              <TableCell>Risk Score</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWorkers.map((worker) => {
              const p = worker.profile || {};
              return (
                <TableRow key={worker.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {p.full_name || worker.username}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      ID: {p.employee_id || `EMP-${String(worker.id).padStart(4, '0')}`} | {p.designation || 'Worker'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{worker.email}</Typography>
                    <Typography variant="caption" color="textSecondary">{p.phone_number || 'No Phone'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{p.department || 'Operations'}</Typography>
                    <Typography variant="caption" color="textSecondary">{p.mine_location || 'Zone 1'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={worker.is_active ? 'Active' : 'Inactive'}
                      color={worker.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: worker.risk_score > 70 ? 'success.main' : 'warning.main' }}>
                      {worker.risk_score ?? 100}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        title="View Full Profile"
                        onClick={() => navigate(`/admin/worker-details?id=${worker.id}`)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="info"
                        title="Edit Details"
                        onClick={() => handleOpenEdit(worker)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color={worker.is_active ? 'warning' : 'success'}
                        title={worker.is_active ? 'Deactivate' : 'Activate'}
                        onClick={() => handleToggleStatus(worker)}
                      >
                        {worker.is_active ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        title="Delete Worker"
                        onClick={() => {
                          setSelectedWorker(worker);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredWorkers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No worker records found matching your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Worker Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Worker Profile</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Full Name"
            fullWidth
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />
          <TextField
            label="Email Address"
            fullWidth
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            label="Department"
            fullWidth
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
          <TextField
            label="Mine Location / Zone"
            fullWidth
            value={formData.mine_location}
            onChange={(e) => setFormData({ ...formData, mine_location: e.target.value })}
          />
          <TextField
            label="Designation"
            fullWidth
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          />
          <TextField
            label="Phone Number"
            fullWidth
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Add Worker Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register New Mine Worker</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Username"
            required
            fullWidth
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          <TextField
            label="Email Address"
            required
            type="email"
            fullWidth
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            label="Temporary Password"
            required
            type="password"
            fullWidth
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <TextField
            label="Full Name"
            fullWidth
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />
          <TextField
            label="Department"
            fullWidth
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
          <TextField
            label="Mine Location / Sector"
            fullWidth
            value={formData.mine_location}
            onChange={(e) => setFormData({ ...formData, mine_location: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateWorker}>Create Worker</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Worker Account Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete worker account for <b>{selectedWorker?.username}</b>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>Delete Account</Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};
