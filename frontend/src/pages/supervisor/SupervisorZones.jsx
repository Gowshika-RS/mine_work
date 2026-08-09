import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { Map as MapIcon } from '@mui/icons-material';

export default function SupervisorZones() {
  const assignedZones = [
    { id: 1, name: 'Sector Alpha Muster Station', type: 'Assembly Point', risk: 'Safe 🟢', status: 'Operational' },
    { id: 2, name: 'Underground First-Aid Station 2', type: 'Medical Room', risk: 'Safe 🟢', status: 'Operational' },
    { id: 3, name: 'Refuge Chamber B', type: 'Shelter', risk: 'Safe 🟢', status: 'Operational' },
    { id: 4, name: 'Restricted Blasting Pit 3', type: 'Restricted Danger Zone', risk: 'Critical 🔴', status: 'Restricted Access' },
  ];

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
        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
          <MapIcon sx={{ fontSize: 36, color: '#38bdf8' }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Assigned Mine Sector Zones & Assembly Points
            </Typography>
            <Typography variant="body2" color="#94a3b8">
              Monitor designated safe zones, refuge chambers, emergency exits, and restricted danger sectors
            </Typography>
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#1e293b' }}>
              <TableRow>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Zone Name</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Zone Type</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Risk Classification</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignedZones.map((z) => (
                <TableRow key={z.id}>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>{z.name}</TableCell>
                  <TableCell sx={{ color: '#38bdf8' }}>{z.type}</TableCell>
                  <TableCell sx={{ color: z.risk.includes('Critical') ? '#f87171' : '#4ade80', fontWeight: 'bold' }}>
                    {z.risk}
                  </TableCell>
                  <TableCell>
                    <Chip label={z.status} color={z.status.includes('Restricted') ? 'error' : 'success'} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
