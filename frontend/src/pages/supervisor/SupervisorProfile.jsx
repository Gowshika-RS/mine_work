import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, TextField, Button, Avatar, Divider, Switch, FormControlLabel, Stack, Alert } from '@mui/material';
import { Person, Security, Notifications, DarkMode, Save, Language } from '@mui/icons-material';
import apiClient from '../../api/client';
import { LanguageSelector } from '../../components/LanguageSelector';

export const SupervisorProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/supervisor/profile');
      setProfileData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handlePasswordChange = async () => {
    if (passwords.new_password !== passwords.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    try {
      await apiClient.post('/auth/reset-password', { email: profileData.email, new_password: passwords.new_password });
      setSuccess('Password updated successfully!');
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError('Failed to update password');
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="primary">Supervisor Profile & Settings</Typography>
        <Typography variant="body2" color="text.secondary">Manage personnel info, credentials & operational preferences</Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center', p: 3 }}>
            <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 32 }}>
              {profileData?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6" fontWeight={700}>{profileData?.profile?.full_name || profileData?.username}</Typography>
            <Typography variant="caption" color="text.secondary" display="block">{profileData?.profile?.employee_id} • {profileData?.profile?.designation}</Typography>
            <Chip label="ROLE: SUPERVISOR" color="warning" size="small" sx={{ mt: 1.5, fontWeight: 700 }} />
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Profile Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth label="Username" disabled size="small" value={profileData?.username || ''} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Email" disabled size="small" value={profileData?.email || ''} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Mine Location" disabled size="small" value={profileData?.profile?.mine_location || ''} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Department" disabled size="small" value={profileData?.profile?.department || ''} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Phone" disabled size="small" value={profileData?.profile?.phone_number || ''} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Emergency Contact" disabled size="small" value={profileData?.profile?.emergency_contact_number || ''} /></Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Language sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Language & Localization</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select your preferred system interface language. All operational views, notifications, and menus will adapt to your chosen language.
              </Typography>
              <LanguageSelector size="small" showLabel={true} />
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Security & Preferences</Typography>
              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight={600}>Change Password</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField fullWidth type="password" label="New Password" size="small" value={passwords.new_password} onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })} /></Grid>
                  <Grid item xs={6}><TextField fullWidth type="password" label="Confirm Password" size="small" value={passwords.confirm_password} onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })} /></Grid>
                </Grid>
                <Button variant="contained" sx={{ width: 200 }} startIcon={<Save />} onClick={handlePasswordChange}>
                  Update Password
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
