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
  Alert,
  CircularProgress
} from '@mui/material';
import {
  GpsFixed as ZoneIcon,
  Add as AddIcon,
  Shield as SafeIcon,
  Warning as DangerIcon
} from '@mui/icons-material';
import apiClient from '../../api/client';

export default function MineZonesGeofencing() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMineZones();
  }, []);

  const fetchMineZones = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/zones');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load mine zones:', err);
      setError('Could not fetch mine zone configuration.');
    } finally {
      setLoading(false);
    }
  };

  const { zones = [] } = data || {};

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
            <ZoneIcon sx={{ fontSize: 36, color: '#ef4444' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Mine Zone & Software Geofencing Management
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Configure Safe Zones, Danger/Restricted Zones, Emergency Exits, Shelters, and track geofence violation alerts
              </Typography>
            </Box>
          </Box>
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
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Zone Name</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>GPS Coordinates</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Risk Level</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Geofence Alert Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {zones.map((z) => (
                  <TableRow key={z.id}>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>{z.name}</TableCell>
                    <TableCell sx={{ color: '#38bdf8' }}>{z.zone_type.toUpperCase()}</TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>
                      {z.latitude ? `Lat ${z.latitude}, Lng ${z.longitude}` : 'Circle Geometry Active'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={z.risk_level}
                        color={z.risk_level === 'Critical' ? 'error' : (z.risk_level === 'High Risk' ? 'warning' : 'success')}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#4ade80' }}>Active Software Fence ✔</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
