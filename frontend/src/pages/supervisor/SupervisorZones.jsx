import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem,
  Stack, Alert, CircularProgress, IconButton
} from '@mui/material';
import { Map as MapIcon, Add, Edit, Delete, Refresh, Shield, Warning } from '@mui/icons-material';
import apiClient from '../../api/client';

export default function SupervisorZones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editZone, setEditZone] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'Assembly Point', risk: 'Safe 🟢', status: 'Operational' });
  const [toast, setToast] = useState('');

  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/supervisor/zones');
      setZones(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleOpenAdd = () => {
    setEditZone(null);
    setFormData({ name: '', type: 'Assembly Point', risk: 'Safe 🟢', status: 'Operational' });
    setOpenModal(true);
  };

  const handleOpenEdit = (zone) => {
    setEditZone(zone);
    setFormData({ name: zone.name, type: zone.type, risk: zone.risk, status: zone.status });
    setOpenModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editZone) {
        await apiClient.put(`/supervisor/zones/${editZone.id}`, formData);
        setToast(`Mine Zone '${formData.name}' updated successfully.`);
      } else {
        await apiClient.post('/supervisor/zones', formData);
        setToast(`New Mine Zone '${formData.name}' created successfully.`);
      }
      setOpenModal(false);
      fetchZones();
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      alert('Failed to save mine zone');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Mine Zone?')) return;
    try {
      await apiClient.delete(`/supervisor/zones/${id}`);
      setToast('Mine Zone deleted.');
      fetchZones();
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      alert('Failed to delete zone');
    }
  };

  return (
    <Box sx={{ py: 2, maxWidth: 1100, mx: 'auto' }}>
      <Paper
        elevation={3}
        sx={{
          p: 3, borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff', border: '1px solid #334155'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <MapIcon sx={{ fontSize: 36, color: '#38bdf8' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Assigned Mine Sector Zones & Geofences (Real-Time CRUD)
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Create, configure, update, and manage active safe sectors, refuge chambers & restricted blasting zones
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={fetchZones} sx={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.4)' }}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd} sx={{ bgcolor: '#38bdf8', color: '#0f172a', fontWeight: 'bold', '&:hover': { bgcolor: '#0284c7' } }}>
              Add Mine Zone
            </Button>
          </Stack>
        </Box>

        {toast && <Alert severity="success" sx={{ mb: 2, fontWeight: 'bold' }}>{toast}</Alert>}

        <TableContainer component={Paper} sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#1e293b' }}>
              <TableRow>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Zone Name</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Zone Type</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Risk Classification</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell>
                </TableRow>
              ) : zones.map((z) => (
                <TableRow key={z.id}>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>{z.name}</TableCell>
                  <TableCell sx={{ color: '#38bdf8' }}>{z.type}</TableCell>
                  <TableCell sx={{ color: z.risk.includes('Critical') ? '#f87171' : '#4ade80', fontWeight: 'bold' }}>
                    {z.risk}
                  </TableCell>
                  <TableCell>
                    <Chip label={z.status} color={z.status.includes('Restricted') ? 'error' : 'success'} size="small" sx={{ fontWeight: 'bold' }} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenEdit(z)} sx={{ color: '#38bdf8' }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(z.id)} sx={{ color: '#f87171' }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add / Edit Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1e293b', color: '#ffffff', fontWeight: 'bold' }}>
          {editZone ? 'Edit Mine Zone & Geofence' : 'Create New Mine Zone'}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#0f172a', pt: 3 }}>
          <form onSubmit={handleSave}>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Zone Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                InputLabelProps={{ style: { color: '#94a3b8' } }}
                InputProps={{ style: { color: '#ffffff' } }}
              />

              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94a3b8' }}>Zone Classification Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Zone Classification Type"
                  sx={{ color: '#ffffff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                >
                  <MenuItem value="Assembly Point">Assembly Point / Muster Area</MenuItem>
                  <MenuItem value="Medical Room">Medical Room / First Aid Station</MenuItem>
                  <MenuItem value="Shelter">Refuge Chamber / Underground Shelter</MenuItem>
                  <MenuItem value="Restricted Danger Zone">Restricted Blasting / High Risk Zone</MenuItem>
                  <MenuItem value="Ventilation Tunnel">Ventilation Shaft Tunnel</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94a3b8' }}>Risk Level</InputLabel>
                <Select
                  value={formData.risk}
                  onChange={(e) => setFormData({ ...formData, risk: e.target.value })}
                  label="Risk Level"
                  sx={{ color: '#ffffff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                >
                  <MenuItem value="Safe 🟢">Safe 🟢</MenuItem>
                  <MenuItem value="Warning 🟡">Warning 🟡</MenuItem>
                  <MenuItem value="Critical 🔴">Critical 🔴</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94a3b8' }}>Operational Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Operational Status"
                  sx={{ color: '#ffffff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                >
                  <MenuItem value="Operational">Operational</MenuItem>
                  <MenuItem value="Restricted Access">Restricted Access</MenuItem>
                  <MenuItem value="Evacuated">Evacuated</MenuItem>
                  <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </form>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#0f172a', p: 2 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#38bdf8', color: '#0f172a', fontWeight: 'bold' }}>
            {editZone ? 'Save Changes' : 'Create Zone'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
