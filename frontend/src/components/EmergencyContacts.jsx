import React from 'react';
import {
  Card, CardContent, Typography, Grid, Button, Box, Chip, Divider, Avatar, Stack
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SecurityIcon from '@mui/icons-material/Security';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import BuildIcon from '@mui/icons-material/Build';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

const CONTACTS = [
  { name: 'Mine Ambulance', phone: '108', ext: 'Ext. 911', icon: <MedicalServicesIcon color="error" />, category: 'Medical' },
  { name: 'Fire & Rescue Team', phone: '101', ext: 'Ext. 912', icon: <LocalFireDepartmentIcon color="warning" />, category: 'Fire' },
  { name: 'Mine Security Dispatch', phone: '100', ext: 'Ext. 913', icon: <SecurityIcon color="primary" />, category: 'Security' },
  { name: 'Mine Hospital', phone: '+91 98765 11111', ext: 'Ext. 914', icon: <LocalHospitalIcon color="error" />, category: 'Hospital' },
  { name: 'Maintenance Team', phone: '+91 98765 22222', ext: 'Ext. 915', icon: <BuildIcon color="action" />, category: 'Maintenance' },
  { name: 'Safety Officer', phone: '+91 98765 33333', ext: 'Ext. 916', icon: <SupervisorAccountIcon color="info" />, category: 'Safety' },
  { name: 'Supervisor Hotline', phone: '+91 98765 43210', ext: 'Direct', icon: <SupervisorAccountIcon color="primary" />, category: 'Supervisor' },
  { name: 'Control Room Admin', phone: '+91 98765 43211', ext: 'Direct', icon: <AdminPanelSettingsIcon color="secondary" />, category: 'Admin' },
  { name: 'National Emergency', phone: '112', ext: 'Toll Free', icon: <LocalPhoneIcon color="error" />, category: 'National' },
];

export const EmergencyContacts = () => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
            <LocalPhoneIcon color="error" /> Emergency Contacts Directory
          </Typography>
          <Chip label="24/7 Hotline Active" color="error" size="small" sx={{ fontWeight: 'bold' }} />
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          Tap any button for 1-click speed dial to dispatchers, rescue units, and safety supervisors.
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          {CONTACTS.map((contact) => (
            <Grid item xs={12} sm={6} md={4} key={contact.name}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#fafafa',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: '#f0f4f8', transform: 'translateY(-2px)' }
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ bgcolor: '#ffffff', boxShadow: 1, width: 40, height: 40 }}>
                    {contact.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {contact.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {contact.phone} • {contact.ext}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  component="a"
                  href={`tel:${contact.phone}`}
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<LocalPhoneIcon fontSize="small" />}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                >
                  Call
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default EmergencyContacts;
