import React, { useState } from 'react';
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
  Chip,
  Button
} from '@mui/material';
import { FactCheck as IncidentIcon } from '@mui/icons-material';

export default function SupervisorIncidents() {
  const sampleIncidents = [
    { id: 'INC-2026-001', type: 'Hazard Escalation', worker: 'John Miner (MW1024)', location: 'Sector Alpha', priority: 'High', status: 'Under Investigation', date: '2026-08-08' },
    { id: 'INC-2026-002', type: 'Geofence Breach', worker: 'Kenisha R S (EMP-0006)', location: 'Blasting Pit 3', priority: 'Critical', status: 'Escalated to Admin', date: '2026-08-08' },
    { id: 'INC-2026-003', type: 'PPE Non-Compliance', worker: 'Alex Coal (MW1025)', location: 'Shaft 1 Entrance', priority: 'Medium', status: 'Resolved ✔', date: '2026-08-07' },
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
          <IncidentIcon sx={{ fontSize: 36, color: '#ec4899' }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Team Incident Management & Log
            </Typography>
            <Typography variant="body2" color="#94a3b8">
              Track, investigate, resolve, and escalate safety incidents for assigned workers
            </Typography>
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#1e293b' }}>
              <TableRow>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Incident ID</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Worker</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Location</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Priority</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleIncidents.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>{row.id}</TableCell>
                  <TableCell sx={{ color: '#38bdf8' }}>{row.type}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{row.worker}</TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>{row.location}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.priority}
                      color={row.priority === 'Critical' ? 'error' : (row.priority === 'High' ? 'warning' : 'info')}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      color={row.status.includes('Resolved') ? 'success' : (row.status.includes('Escalated') ? 'error' : 'warning')}
                      size="small"
                    />
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
