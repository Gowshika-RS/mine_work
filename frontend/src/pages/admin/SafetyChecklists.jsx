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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Checklist as ChecklistIcon,
  Add as AddIcon,
  CheckCircle as DoneIcon,
  HourglassEmpty as PendingIcon
} from '@mui/icons-material';
import apiClient from '../../api/client';

export default function SafetyChecklists() {
  const [openDialog, setOpenDialog] = useState(false);
  const [checklistTitle, setChecklistTitle] = useState('');

  const sampleChecklists = [
    { id: 1, title: 'Pre-Shift Safety & Gear Checklist', items: 5, frequency: 'Daily Pre-Shift', completion_rate: '94%', status: 'Active' },
    { id: 2, title: 'Underground Gas Detector Verification', items: 4, frequency: 'Daily Pre-Shift', completion_rate: '98%', status: 'Active' },
    { id: 3, title: 'Heavy Vehicle Pre-Operation Check', items: 6, frequency: 'Daily Shift Start', completion_rate: '91%', status: 'Active' },
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <ChecklistIcon sx={{ fontSize: 36, color: '#a855f7' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Precaution Checklist Management
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Manage mandatory underground safety checklists, set required items, and track worker completion
              </Typography>
            </Box>
          </Box>

          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)} sx={{ bgcolor: '#9333ea' }}>
            Create New Checklist Template
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ bgcolor: '#090d16', border: '1px solid #334155', borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#1e293b' }}>
              <TableRow>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Template Name</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Items Count</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Frequency</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Worker Completion Rate</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleChecklists.map((c) => (
                <TableRow key={c.id}>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>{c.title}</TableCell>
                  <TableCell sx={{ color: '#38bdf8' }}>{c.items} Mandatory Checks</TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>{c.frequency}</TableCell>
                  <TableCell sx={{ color: '#4ade80', fontWeight: 'bold' }}>{c.completion_rate}</TableCell>
                  <TableCell>
                    <Chip label={c.status} color="success" size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{ sx: { bgcolor: '#0f172a', color: '#fff', border: '1px solid #334155' } }}>
        <DialogTitle>Create Mine Precaution Checklist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Checklist Title"
            value={checklistTitle}
            onChange={(e) => setChecklistTitle(e.target.value)}
            sx={{ mt: 2, bgcolor: '#1e293b', borderRadius: 1, input: { color: '#fff' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)} sx={{ bgcolor: '#9333ea' }}>Create Template</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
