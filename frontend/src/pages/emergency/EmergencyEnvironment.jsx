import { Box, Card, CardContent, Typography, Grid, LinearProgress, Stack, Button, Chip } from '@mui/material';
import { Air, Speed, Warning, Campaign } from '@mui/icons-material';

export const EmergencyEnvironment = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#0b0f19', minHeight: '100vh', color: '#f8fafc' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Air sx={{ color: '#38bdf8', fontSize: 36 }} /> Toxic Gas & Environmental Disaster Alarms
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          Real-time gas concentration thresholds, ventilation fan diagnostics, and automated evacuation triggers
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Methane Gas Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#151c2c', borderRadius: 3, border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ffffff' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#fca5a5' }}>
                  CH4 (Methane Concentration)
                </Typography>
                <Chip label="WARNING LEVEL" color="error" sx={{ fontWeight: 'bold' }} />
              </Stack>
              <Typography variant="h3" fontWeight="800" sx={{ color: '#ef4444', mb: 1 }}>
                1.8% <Typography component="span" variant="body1" sx={{ color: '#94a3b8' }}>(Safe Limit: 1.5%)</Typography>
              </Typography>
              <LinearProgress variant="determinate" value={72} color="error" sx={{ height: 10, borderRadius: 3, mb: 2 }} />
              <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 2 }}>
                High gas accumulation detected near Shaft 2 Working Face. Auxiliary fans engaged at 100% capacity.
              </Typography>
              <Button variant="contained" color="error" fullWidth startIcon={<Campaign />}>
                Sound Gas Evacuation Siren
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Carbon Monoxide Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#151c2c', borderRadius: 3, border: '1px solid rgba(16, 185, 129, 0.3)', color: '#ffffff' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#6ee7b7' }}>
                  CO (Carbon Monoxide)
                </Typography>
                <Chip label="NORMAL" color="success" sx={{ fontWeight: 'bold' }} />
              </Stack>
              <Typography variant="h3" fontWeight="800" sx={{ color: '#10b981', mb: 1 }}>
                18 PPM <Typography component="span" variant="body1" sx={{ color: '#94a3b8' }}>(Safe Limit: 30 PPM)</Typography>
              </Typography>
              <LinearProgress variant="determinate" value={30} color="success" sx={{ height: 10, borderRadius: 3, mb: 2 }} />
              <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 2 }}>
                CO telemetry within safe boundaries across all ventilation ducts.
              </Typography>
              <Button variant="outlined" color="success" fullWidth>
                View Duct Sensors
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
