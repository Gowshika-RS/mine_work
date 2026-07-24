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
import { Search, PersonAdd, Delete, Key, Block, CheckCircle } from '@mui/icons-material';
import apiClient from '../../api/client';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modals
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [resetPassDialogOpen, setResetPassDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'worker',
    full_name: '',
    department: 'Operations',
    mine_location: 'Zone 1',
    phone_number: '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load system users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const haystack = `${u.username} ${u.email} ${u.full_name} ${u.role}`.toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleCreateUser = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      setToast({ open: true, message: 'Username, email and password are required', severity: 'error' });
      return;
    }
    try {
      await apiClient.post('/admin/users', formData);
      setToast({ open: true, message: 'New user registered successfully', severity: 'success' });
      setAddDialogOpen(false);
      loadUsers();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.detail || 'Failed to create user', severity: 'error' });
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.is_active;
      await apiClient.put(`/admin/workers/${user.id}/status?is_active=${newStatus}`);
      setToast({ open: true, message: `Account ${newStatus ? 'activated' : 'disabled'}`, severity: 'success' });
      loadUsers();
    } catch (err) {
      setToast({ open: true, message: 'Failed to update user status', severity: 'error' });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    try {
      await apiClient.post(`/admin/users/${selectedUser.id}/reset-password`, { new_password: newPassword });
      setToast({ open: true, message: 'Password reset successfully', severity: 'success' });
      setResetPassDialogOpen(false);
      setNewPassword('');
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.detail || 'Failed to reset password', severity: 'error' });
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await apiClient.delete(`/admin/workers/${id}`);
      setToast({ open: true, message: 'User account removed', severity: 'success' });
      loadUsers();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.detail || 'Failed to delete user', severity: 'error' });
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'supervisor':
        return 'warning';
      case 'emergency':
        return 'info';
      default:
        return 'primary';
    }
  };

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
            User Account Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage Workers, Supervisors, Emergency Personnel, and Administrative accounts
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add New User
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
                placeholder="Search user by username, email, full name..."
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
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Role Filter</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label="Role Filter"
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="worker">Mine Worker</MenuItem>
                <MenuItem value="supervisor">Site Supervisor</MenuItem>
                <MenuItem value="emergency">Emergency Personnel</MenuItem>
                <MenuItem value="admin">System Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Users Data Table */}
      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
            <TableRow>
              <TableCell>User Profile</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department & Sector</TableCell>
              <TableCell>Account Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {u.full_name || u.username}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    @{u.username} | ID: {u.employee_id}
                  </Typography>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Chip
                    label={u.role.toUpperCase()}
                    color={getRoleColor(u.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{u.department}</Typography>
                  <Typography variant="caption" color="textSecondary">{u.mine_location}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={u.is_active ? 'Enabled' : 'Disabled'}
                    color={u.is_active ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      color="warning"
                      title="Reset Password"
                      onClick={() => {
                        setSelectedUser(u);
                        setResetPassDialogOpen(true);
                      }}
                    >
                      <Key fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color={u.is_active ? 'default' : 'success'}
                      title={u.is_active ? 'Disable Account' : 'Enable Account'}
                      onClick={() => handleToggleStatus(u)}
                    >
                      {u.is_active ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      title="Delete User Account"
                      onClick={() => handleDeleteUser(u.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No system users match the current search filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add System User (Worker / Supervisor / Emergency)</DialogTitle>
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
            label="Password"
            required
            type="password"
            fullWidth
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <FormControl fullWidth>
            <InputLabel>Account Role</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              label="Account Role"
            >
              <MenuItem value="worker">Mine Worker</MenuItem>
              <MenuItem value="supervisor">Site Supervisor</MenuItem>
              <MenuItem value="emergency">Emergency Personnel</MenuItem>
              <MenuItem value="admin">System Admin</MenuItem>
            </Select>
          </FormControl>
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
            label="Mine Sector / Location"
            fullWidth
            value={formData.mine_location}
            onChange={(e) => setFormData({ ...formData, mine_location: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateUser}>Create User</Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPassDialogOpen} onClose={() => setResetPassDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reset User Password</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Enter new password for account <b>@{selectedUser?.username}</b>
          </Typography>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPassDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleResetPassword}>Reset Password</Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};
