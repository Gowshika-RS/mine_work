import { Box, Grid, Card, CardContent, Typography, Button, IconButton, Avatar, Chip, LinearProgress } from '@mui/material';
import { WbSunny, Cloud, LocalFireDepartment, Warning, Assignment, Sos, DirectionsRun } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const WorkerDashboard = () => {
  const navigate = useNavigate();

  // Mock data for the redesigned dashboard
  const user = { name: 'John Doe' };
  const shift = { current: '08:00 AM - 04:00 PM', hoursWorked: 4.5, totalHours: 8 };
  const safetyStatus = { status: 'Medium Risk', color: 'warning.main', score: 72 };
  const environment = { weather: 'Sunny', surfaceTemp: '32°C', mineTemp: '28°C', location: 'Level 3, Sector B' };
  
  const alerts = [
    { id: 1, type: 'Gas Alert', msg: 'Methane levels elevated in Sector B', time: '10 mins ago', color: 'error.main' },
  ];

  return (
    <Box sx={{ py: 2 }}>
      {/* Header / Greeting */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', mr: 2 }}>JD</Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Hello, {user.name}</Typography>
          <Typography variant="body2" color="textSecondary">Stay safe today.</Typography>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* Safety Status & Risk Score */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Safety Status</Typography>
                <Chip label={safetyStatus.status} sx={{ bgcolor: safetyStatus.color, color: '#fff', fontWeight: 'bold' }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: safetyStatus.color, mr: 1 }}>
                  {safetyStatus.score}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>/ 100 Risk Score</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={safetyStatus.score} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': { bgcolor: safetyStatus.color }
                }} 
              />
              <Button 
                variant="text" 
                sx={{ mt: 2, p: 0, fontWeight: 'bold' }}
                onClick={() => navigate('/worker/risk-analysis')}
              >
                View Full Analysis &rarr;
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Shift Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Current Shift</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                {shift.current}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="textSecondary">Hours Worked</Typography>
                <Typography variant="body2" fontWeight="bold">{shift.hoursWorked} / {shift.totalHours} hrs</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(shift.hoursWorked / shift.totalHours) * 100} 
                sx={{ height: 8, borderRadius: 4 }} 
                color="primary"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Environment & Location */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-around' }}>
              <Box sx={{ textAlign: 'center' }}>
                <WbSunny sx={{ color: 'warning.main', fontSize: 32, mb: 1 }} />
                <Typography variant="body2" color="textSecondary">Surface</Typography>
                <Typography variant="body1" fontWeight="bold">{environment.surfaceTemp}</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Cloud sx={{ color: 'info.main', fontSize: 32, mb: 1 }} />
                <Typography variant="body2" color="textSecondary">Mine</Typography>
                <Typography variant="body1" fontWeight="bold">{environment.mineTemp}</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <DirectionsRun sx={{ color: 'success.main', fontSize: 32, mb: 1 }} />
                <Typography variant="body2" color="textSecondary">Location</Typography>
                <Typography variant="body1" fontWeight="bold">{environment.location}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>Quick Actions</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => navigate('/worker/checklist')}>
                <CardContent sx={{ p: 2 }}>
                  <Assignment sx={{ color: 'primary.main', fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" fontWeight="bold">Checklist</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => navigate('/worker/hazards')}>
                <CardContent sx={{ p: 2 }}>
                  <Warning sx={{ color: 'warning.main', fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" fontWeight="bold">Report Hazard</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => navigate('/worker/ai-prediction')}>
                <CardContent sx={{ p: 2 }}>
                  <LocalFireDepartment sx={{ color: 'error.main', fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" fontWeight="bold">AI Sensors</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', bgcolor: 'error.light', color: '#fff' }}>
                <CardContent sx={{ p: 2 }}>
                  <Sos sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" fontWeight="bold">Emergency</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>Recent Alerts</Typography>
          {alerts.map((alert) => (
            <Card key={alert.id} sx={{ mb: 1, borderLeft: `6px solid`, borderColor: alert.color }}>
              <CardContent sx={{ py: '12px !important', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" color={alert.color}>{alert.type}</Typography>
                  <Typography variant="body2">{alert.msg}</Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">{alert.time}</Typography>
              </CardContent>
            </Card>
          ))}
        </Grid>

      </Grid>
    </Box>
  );
};
