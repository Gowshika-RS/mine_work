import { Box, Card, CardContent, Typography, Grid, Avatar, Button, Divider, Chip } from '@mui/material';
import { Email, Phone, LocationOn, VerifiedUser } from '@mui/icons-material';

export const WorkerDetails = () => {
  const worker = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    department: 'Manufacturing',
    location: 'Plant A',
    employeeId: 'EMP-001',
    status: 'active',
    safetyScore: 92,
    joinDate: '2022-03-15',
    incidents: 2,
    certifications: ['CPR', 'First Aid', 'OSHA'],
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Worker Details
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, fontSize: '3rem' }}>
                {worker.name.charAt(0)}
                {worker.name.split(' ')[1]?.charAt(0)}
              </Avatar>
              <Typography variant="h6">{worker.name}</Typography>
              <Chip label={worker.status} color={worker.status === 'active' ? 'success' : 'default'} sx={{ my: 1 }} />
              <Typography variant="h4" sx={{ color: 'success.main', my: 1 }}>
                {worker.safetyScore}%
              </Typography>
              <Typography color="textSecondary" variant="body2">
                Safety Score
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button variant="contained" size="small" fullWidth>
                  Edit
                </Button>
                <Button variant="outlined" size="small" fullWidth color="error">
                  Deactivate
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Contact Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email />
                  <Typography>{worker.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone />
                  <Typography>{worker.phone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn />
                  <Typography>{worker.location}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>
                Employment Details
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">
                    Employee ID
                  </Typography>
                  <Typography>{worker.employeeId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">
                    Department
                  </Typography>
                  <Typography>{worker.department}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">
                    Join Date
                  </Typography>
                  <Typography>{worker.joinDate}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">
                    Incidents
                  </Typography>
                  <Typography>{worker.incidents}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>
                Certifications
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {worker.certifications.map((cert) => (
                  <Chip key={cert} label={cert} icon={<VerifiedUser />} color="primary" variant="outlined" />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
