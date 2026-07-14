import { Box, Card, CardContent, Typography, TextField, Button, Grid, Avatar, CircularProgress, Alert } from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import apiClient from '../../api/client';

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    location: '',
    employeeId: '',
    bloodGroup: '',
    medicalConditions: '',
    emergencyName: '',
    emergencyPhone: '',
  });

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/users/me');
      const data = response.data;
      setUser(data);
      if (data.profile) {
        setProfileData({
          fullName: data.profile.full_name || '',
          email: data.email || '',
          phone: data.profile.phone_number || '',
          department: data.profile.department || 'Operations',
          location: data.profile.mine_location || 'Main Shaft',
          employeeId: data.profile.employee_id || `EMP-${data.id}`,
          bloodGroup: data.profile.blood_group || 'O+',
          medicalConditions: data.profile.medical_conditions || '',
          emergencyName: data.profile.emergency_contact_name || '',
          emergencyPhone: data.profile.emergency_contact_number || '',
        });
      } else {
        setProfileData(prev => ({
          ...prev,
          email: data.email || '',
          employeeId: `EMP-${data.id}`,
        }));
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Could not load profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    try {
      // 1. Update worker profile endpoint
      await apiClient.put(`/workers/${user.id}/profile`, {
        full_name: profileData.fullName,
        phone_number: profileData.phone,
        blood_group: profileData.bloodGroup,
        medical_conditions: profileData.medicalConditions,
        emergency_contact_name: profileData.emergencyName,
        emergency_contact_number: profileData.emergencyPhone,
        department: profileData.department,
        mine_location: profileData.location
      });

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError(err.response?.data?.detail || 'Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Employee Profile
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  mx: 'auto', 
                  mb: 2, 
                  fontSize: '2.5rem',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText' 
                }}
              >
                {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                {profileData.fullName || 'User Profile'}
              </Typography>
              <Typography color="textSecondary" sx={{ mb: 2 }}>
                {profileData.department} &bull; {profileData.location}
              </Typography>
              <Button
                variant={isEditing ? 'contained' : 'outlined'}
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
                startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                sx={{ borderRadius: 6 }}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee Name"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    name="employeeId"
                    value={profileData.employeeId}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    value={profileData.email}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile Phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Blood Group"
                    name="bloodGroup"
                    value={profileData.bloodGroup}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={profileData.department}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mine Location"
                    name="location"
                    value={profileData.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Medical Conditions"
                    name="medicalConditions"
                    value={profileData.medicalConditions}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Name"
                    name="emergencyName"
                    value={profileData.emergencyName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Emergency Phone"
                    name="emergencyPhone"
                    value={profileData.emergencyPhone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>

              {isEditing && (
                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                  <Button variant="contained" onClick={handleSave} startIcon={<SaveIcon />}>
                    Save
                  </Button>
                  <Button variant="outlined" onClick={() => setIsEditing(false)} startIcon={<CancelIcon />}>
                    Cancel
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
