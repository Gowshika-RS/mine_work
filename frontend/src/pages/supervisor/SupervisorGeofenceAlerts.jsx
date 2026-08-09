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
  Button,
  Alert
} from '@mui/material';
import { Warning as AlertIcon } from '@mui/icons-material';

export default function SupervisorGeofenceAlerts() {
  const [actioned, setActioned] = useState('');

  const geofenceEvents = [
    { id: 1, worker: 'Kenisha R S (EMP-0006)', zone: 'Restricted Blasting Pit 3', risk: 'Critical', time: '10 mins ago', status: 'Active Violation' },
    { id: 2, worker: 'John Miner (MW1024)', zone: 'Unventilated Shaft 2', risk: 'High Risk', time: '1 hour ago', status: 'Warning Sent' }
  ];

  const handleSendWarning = (workerName) => {
    setActioned(`Immediate geofence warning dispatched to ${workerName}`);
    setTimeout(() => setActioned(''), 3000);
  };

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
          <AlertIcon sx={{ fontSize: 36, color: '#ef4444' }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Geofence & Restricted Zone Violation Alerts
            </Typography>
            <Typography variant="body2" color="#94a3b8">
              Real-time telemetry when an assigned worker enters a software-configured restricted or hazardous zone
            </Typography>
          </Box>
        </Box>

        {actioned && <Alert severity="warning" sx={{ mb: 2 }}>{actioned}</Alert>}

        <TableContainer component={Paper} sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#1e293b' }}>
              <TableRow>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Worker</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Breached Zone</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Risk Level</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Timestamp</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Response Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {geofenceEvents.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>{row.worker}</TableCell>
                  <TableCell sx={{ color: '#f87171', fontWeight: 'bold' }}>{row.zone}</TableCell>
                  <TableCell>
                    <Chip label={row.risk} color="error" size="small" sx={{ fontWeight: 'bold' }} />
                  </TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>{row.time}</TableCell>
                  <TableCell>
                    <Button size="small" variant="contained" color="error" onClick={() => handleSendWarning(row.worker)}>
                      Send Evacuation Warning
                    </Button>
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
