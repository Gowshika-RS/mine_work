import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Button, CircularProgress, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer } from '@mui/material';
import { EventAvailable, Refresh } from '@mui/icons-material';
import apiClient from '../../api/client';

export const SupervisorAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const res = await apiClient.get('/supervisor/attendance');
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary">Attendance Monitoring</Typography>
          <Typography variant="body2" color="text.secondary">Real-time check-in, check-out, shift hours & overtime logs</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchAttendance}>Refresh Logs</Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>Worker Name</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>Check-in Time</TableCell>
              <TableCell>Check-out Time</TableCell>
              <TableCell>Shift Hours</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length > 0 ? records.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell fontWeight={700}>{r.worker_name}</TableCell>
                <TableCell>{r.employee_id}</TableCell>
                <TableCell>{r.start_time}</TableCell>
                <TableCell>{r.end_time}</TableCell>
                <TableCell>{r.total_hours}</TableCell>
                <TableCell>
                  <Chip
                    label={r.attendance_status}
                    color={r.attendance_status === 'PRESENT' ? 'success' : r.attendance_status === 'LATE' ? 'warning' : 'default'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={6} align="center">No attendance check-ins logged today.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
