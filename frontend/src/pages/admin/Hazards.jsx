import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';
import { Warning, Dangerous } from '@mui/icons-material';

export const Hazards = () => {
  const hazards = [
    {
      id: 1,
      title: 'Electrical Hazard',
      location: 'Plant A - Section B',
      severity: 'high',
      reportedBy: 'John Doe',
      time: '2 hours ago',
      status: 'active',
    },
    {
      id: 2,
      title: 'Slippery Floor',
      location: 'Warehouse - Level 2',
      severity: 'medium',
      reportedBy: 'Jane Smith',
      time: '4 hours ago',
      status: 'resolved',
    },
    {
      id: 3,
      title: 'Chemical Spill',
      location: 'Lab A',
      severity: 'critical',
      reportedBy: 'Mike Johnson',
      time: '6 hours ago',
      status: 'active',
    },
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Hazards Management
      </Typography>

      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Reported By</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hazards.map((hazard) => (
              <TableRow key={hazard.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {hazard.severity === 'critical' ? <Dangerous /> : <Warning />}
                    {hazard.title}
                  </Box>
                </TableCell>
                <TableCell>{hazard.location}</TableCell>
                <TableCell>
                  <Chip label={hazard.severity} color={getSeverityColor(hazard.severity)} size="small" />
                </TableCell>
                <TableCell>{hazard.reportedBy}</TableCell>
                <TableCell>{hazard.time}</TableCell>
                <TableCell>
                  <Chip
                    label={hazard.status}
                    color={hazard.status === 'active' ? 'error' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button size="small">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
