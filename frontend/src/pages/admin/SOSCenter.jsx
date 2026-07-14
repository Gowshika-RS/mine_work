import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Emergency, Phone, LocationOn } from '@mui/icons-material';
import { useState } from 'react';

export const SOSCenter = () => {
  const [sosAlerts, setSOSAlerts] = useState([
    {
      id: 1,
      worker: 'John Doe',
      location: 'Plant A - Section B',
      time: '10:30 AM',
      status: 'active',
      message: 'Medical emergency',
    },
    {
      id: 2,
      worker: 'Jane Smith',
      location: 'Warehouse - Level 2',
      time: '2:45 PM',
      status: 'responded',
      message: 'Equipment malfunction',
    },
  ]);

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleRespond = (alert) => {
    setSelectedAlert(alert);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedAlert(null);
  };

  const handleResolve = () => {
    setSOSAlerts((prev) =>
      prev.map((alert) =>
        alert.id === selectedAlert.id ? { ...alert, status: 'resolved' } : alert
      )
    );
    handleClose();
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        SOS Center
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Card sx={{ backgroundColor: 'error.light', color: 'error.dark', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Emergency sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h6">Active SOS Alerts: {sosAlerts.filter((a) => a.status === 'active').length}</Typography>
              <Typography variant="body2">Monitor and respond to emergency calls from workers</Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
            <TableRow>
              <TableCell>Worker</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sosAlerts.map((alert) => (
              <TableRow key={alert.id} sx={{ backgroundColor: alert.status === 'active' ? 'error.lighter' : 'inherit' }}>
                <TableCell>{alert.worker}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn fontSize="small" />
                    {alert.location}
                  </Box>
                </TableCell>
                <TableCell>{alert.message}</TableCell>
                <TableCell>{alert.time}</TableCell>
                <TableCell>
                  <Chip
                    label={alert.status}
                    color={alert.status === 'active' ? 'error' : alert.status === 'responded' ? 'warning' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleRespond(alert)} disabled={alert.status === 'resolved'}>
                    {alert.status === 'active' ? 'Respond' : 'View'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Respond to SOS Alert</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedAlert && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Worker
                </Typography>
                <Typography>{selectedAlert.worker}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Location
                </Typography>
                <Typography>{selectedAlert.location}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Message
                </Typography>
                <Typography>{selectedAlert.message}</Typography>
              </Box>
              <TextField
                fullWidth
                label="Response Notes"
                multiline
                rows={3}
                placeholder="Enter your response..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleResolve} variant="contained" color="success">
            Mark as Resolved
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
