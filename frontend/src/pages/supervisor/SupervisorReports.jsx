import { useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Stack, Paper, Divider } from '@mui/material';
import { Assessment, PictureAsPdf, TableChart, FileDownload } from '@mui/icons-material';

const reportsList = [
  { id: 'daily', name: 'Daily Mine Safety Report', desc: 'Summary of daily shifts, worker safety scores & minor incidents.' },
  { id: 'weekly', name: 'Weekly Compliance Audit', desc: '7-day overview of hazard resolutions, shift hours & health index.' },
  { id: 'monthly', name: 'Monthly Executive Safety Report', desc: 'Comprehensive analysis of mine atmosphere, near misses & equipment status.' },
  { id: 'health', name: 'Worker Biometric & Health Report', desc: 'Aggregated fatigue, hydration, and medical assessment logs.' },
  { id: 'incident', name: 'Detailed Incident & SOS Log', desc: 'Audit-ready report of all emergency SOS triggers and resolutions.' },
  { id: 'shift', name: 'End-of-Shift Handover Report', desc: 'Supervisor shift summary recommendations for the incoming supervisor.' },
];

export const SupervisorReports = () => {
  const handleExport = (reportName, format) => {
    alert(`Exporting ${reportName} in ${format.toUpperCase()} format... File downloaded successfully.`);
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="primary">Reports & Audit Generator</Typography>
        <Typography variant="body2" color="text.secondary">Generate compliance reports & export in PDF, Excel, or CSV formats</Typography>
      </Box>

      <Grid container spacing={3}>
        {reportsList.map((r) => (
          <Grid item xs={12} md={6} key={r.id}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Assessment color="primary" sx={{ fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={700}>{r.name}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{r.desc}</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 1 }}>Export Formats:</Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" color="error" startIcon={<PictureAsPdf />} onClick={() => handleExport(r.name, 'pdf')}>
                    PDF
                  </Button>
                  <Button size="small" variant="outlined" color="success" startIcon={<TableChart />} onClick={() => handleExport(r.name, 'excel')}>
                    Excel
                  </Button>
                  <Button size="small" variant="outlined" color="info" startIcon={<FileDownload />} onClick={() => handleExport(r.name, 'csv')}>
                    CSV
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
