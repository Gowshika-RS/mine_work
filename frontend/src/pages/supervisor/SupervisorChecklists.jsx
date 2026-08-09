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
import { Checklist as ChecklistIcon } from '@mui/icons-material';

export default function SupervisorChecklists() {
  const [reminded, setReminded] = useState('');

  const sampleChecklists = [
    { id: 1, worker: 'John Miner (MW1024)', checklist: 'Pre-Shift Safety & Gear', status: 'Completed ✔', time: '08:15 AM' },
    { id: 2, worker: 'Alex Coal (MW1025)', checklist: 'Gas Detector Verification', status: 'Completed ✔', time: '08:22 AM' },
    { id: 3, worker: 'Kenisha R S (EMP-0006)', checklist: 'Heavy Vehicle Check', status: 'Pending Overdue ⚠️', time: 'Pending' },
  ];

  const handleSendReminder = (workerName) => {
    setReminded(`Pre-shift checklist reminder sent to ${workerName}`);
    setTimeout(() => setReminded(''), 3000);
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
          <ChecklistIcon sx={{ fontSize: 36, color: '#a855f7' }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Team Safety Checklist Monitoring
            </Typography>
            <Typography variant="body2" color="#94a3b8">
              Track mandatory pre-shift safety checklists for assigned workers and send reminders for overdue items
            </Typography>
          </Box>
        </Box>

        {reminded && <Alert severity="success" sx={{ mb: 2 }}>{reminded}</Alert>}

        <TableContainer component={Paper} sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#1e293b' }}>
              <TableRow>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Worker</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Checklist Name</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Submission Time</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleChecklists.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>{row.worker}</TableCell>
                  <TableCell sx={{ color: '#38bdf8' }}>{row.checklist}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      color={row.status.includes('Completed') ? 'success' : 'warning'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>{row.time}</TableCell>
                  <TableCell>
                    {row.status.includes('Pending') && (
                      <Button size="small" variant="outlined" color="warning" onClick={() => handleSendReminder(row.worker)}>
                        Send Reminder
                      </Button>
                    )}
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
