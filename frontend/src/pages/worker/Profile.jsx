import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid, Avatar,
  CircularProgress, Alert, MenuItem, Select, FormControl, InputLabel, Paper, Divider, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LanguageIcon from '@mui/icons-material/Language';
import SecurityIcon from '@mui/icons-material/Security';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import { LanguageSelector } from '../../components/LanguageSelector';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'ur', name: 'اردو (Urdu)' },
];

export const Profile = () => {
  const { t, i18n } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('i18nextLng') || 'en');

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

  useEffect(() => {
    fetchProfile();
  }, []);

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
          medicalConditions: data.profile.medical_conditions || 'None',
          emergencyName: data.profile.emergency_contact_name || '',
          emergencyPhone: data.profile.emergency_contact_number || '',
        });
      } else {
        setProfileData((prev) => ({
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

  const handleLanguageChange = (e) => {
    const langCode = e.target.value;
    setCurrentLang(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    try {
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

      setSuccess('Profile details updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
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
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      {/* Header Banner */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)', color: '#fff' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar sx={{ width: 90, height: 90, bgcolor: '#ff9800', fontSize: '2.5rem', fontWeight: 'bold' }}>
              {profileData.fullName ? profileData.fullName[0] : 'U'}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" fontWeight="bold">
              {profileData.fullName || user?.username}
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Employee ID: <strong>{profileData.employeeId}</strong> | Role: <strong>{user?.role?.toUpperCase()}</strong>
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {profileData.department} • {profileData.location}
            </Typography>
          </Grid>

          {/* Language Selector Dropdown */}
          <Grid item xs={12} sm="auto">
            <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
              <Box display="flex" alignItems="center" gap={1} sx={{ color: '#fff', mb: 0.5 }}>
                <LanguageIcon />
                <Typography variant="caption" fontWeight="bold">Internationalization (i18n)</Typography>
              </Box>
              <LanguageSelector size="small" showLabel={false} />
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {/* Main Profile Form Card */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" color="primary">
              Personal & Safety Record Details
            </Typography>
            {!isEditing ? (
              <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <Box display="flex" gap={1}>
                <Button variant="outlined" color="secondary" startIcon={<CancelIcon />} onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave}>
                  Save Changes
                </Button>
              </Box>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={profileData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
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
                label="Phone Number"
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
                label="Mine Shaft / Location"
                name="location"
                value={profileData.location}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Medical Conditions / Allergies"
                name="medicalConditions"
                value={profileData.medicalConditions}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold" color="error" sx={{ my: 1 }}>
                Emergency Contact Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact Person"
                name="emergencyName"
                value={profileData.emergencyName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact Phone"
                name="emergencyPhone"
                value={profileData.emergencyPhone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
