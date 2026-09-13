import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { FactCheck, CheckCircle, Warning } from '@mui/icons-material';

export const EmergencyIncidentLogs = () => {
  const logs = [
    { id: 'INC-2026-09', title: 'Methane Gas Spike & Evacuation', zone: 'Shaft 2 Level 3', status: 'RESOLVED', duration: '42 mins', date: '2026-09-12', commander: 'Emergency Officer Vance' },
    { id: 'INC-2026-08', title: 'Rockfall Near Access Ramp B', zone: 'Zone B Tunnel', status: 'RESOLVED', duration: '1 hr 15 mins', date: '2026-09-08', commander: 'Emergency Officer Vance' },
    { id: 'INC-2026-07', title: 'Worker Dehydration SOS', zone: 'Shaft 1 Excavation', status: 'RESOLVED', duration: '18 mins', date: '2026-09-01', commander: 'Medical Squad Lead' }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#0b0f19', minHeight: '100vh', color: '#f8fafc' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FactCheck sx={{ color: '#ec4899', fontSize: 36 }} /> Disaster Incident Logs & Audit Compliance
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          Historical emergency intervention records, response time analytics, and official post-incident reports
        </Typography>
      </Box>

      <TableContainer component={Card} sx={{ bgcolor: '#151c2c', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#1e293b' }}>
            <TableRow>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>INCIDENT ID</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>INCIDENT TITLE</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>LOCATION ZONE</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>COMMAND OFFICER</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>DURATION</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>DATE</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>STATUS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((row) => (
              <TableRow key={row.id}>
                <TableCell sx={{ color: '#ec4899', fontWeight: '800' }}>{row.id}</TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>{row.title}</TableCell>
                <TableCell sx={{ color: '#cbd5e1' }}>{row.zone}</TableCell>
                <TableCell sx={{ color: '#cbd5e1' }}>{row.commander}</TableCell>
                <TableCell sx={{ color: '#cbd5e1' }}>{row.duration}</TableCell>
                <TableCell sx={{ color: '#cbd5e1' }}>{row.date}</TableCell>
                <TableCell>
                  <Chip label={row.status} color="success" size="small" sx={{ fontWeight: 'bold' }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
