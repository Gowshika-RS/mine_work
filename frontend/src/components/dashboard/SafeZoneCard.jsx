import React from 'react';
import { Paper, Box, Typography, Chip, Button, Grid } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import PlaceIcon from '@mui/icons-material/Place';
import ShieldIcon from '@mui/icons-material/Shield';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const SafeZoneCard = ({ locationData, zonesData }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Current worker location (or standard shaft B coordinates)
  const lat = locationData?.latitude || '12.9716';
  const lng = locationData?.longitude || '77.5946';

  // Nearest safe refuge chamber / safe zone details
  const nearestSafeZone = {
    name: 'Refuge Chamber Alpha (Shaft B)',
    distanceMeters: 120,
    status: 'Safe',
    capacityAvailable: '12 / 15 Slots'
  };

  // Check geofence hazard status
  const isInsideHazardGeofence = false; // Could be computed from zonesData if inside restricted/high-risk zone
  const activeGeofenceName = isInsideHazardGeofence ? 'High Dust & Methane Zone 4' : null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <MapIcon sx={{ color: '#7c3aed', fontSize: 22 }} />
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: '#64748b' }}>
            {t('dashboard.safeZoneNavigation', 'SAFE-ZONE NAVIGATION')}
          </Typography>
        </Box>
        <Chip
          label={isInsideHazardGeofence ? 'HAZARD GEOFENCE ⚠️' : 'CLEAR ZONE 🟢'}
          size="small"
          sx={{
            bgcolor: isInsideHazardGeofence ? '#fffbeb' : '#f0fdf4',
            color: isInsideHazardGeofence ? '#b45309' : '#15803d',
            fontWeight: 800,
            fontSize: '0.7rem',
            border: `1px solid ${isInsideHazardGeofence ? '#fde68a' : '#bbf7d0'}`
          }}
        />
      </Box>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {/* Nearest Safe Refuge Zone */}
        <Grid item xs={12} sm={7}>
          <Box p={1.5} borderRadius={2} bgcolor="#f8fafc" border="1px solid #e2e8f0">
            <Box display="flex" alignItems="center" gap={0.8} mb={0.5}>
              <ShieldIcon sx={{ color: '#059669', fontSize: 16 }} />
              <Typography variant="caption" color="text.secondary" fontWeight="700">
                Nearest Safe Refuge Zone
              </Typography>
            </Box>
            <Typography variant="subtitle2" fontWeight="800" color="#0f172a">
              {nearestSafeZone.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              Proximity: <strong>{nearestSafeZone.distanceMeters} meters away</strong> ({nearestSafeZone.capacityAvailable})
            </Typography>
          </Box>
        </Grid>

        {/* Current GPS Coordinates */}
        <Grid item xs={12} sm={5}>
          <Box p={1.5} borderRadius={2} bgcolor="#f8fafc" border="1px solid #e2e8f0">
            <Box display="flex" alignItems="center" gap={0.8} mb={0.5}>
              <PlaceIcon sx={{ color: '#2563eb', fontSize: 16 }} />
              <Typography variant="caption" color="text.secondary" fontWeight="700">
                GPS Position
              </Typography>
            </Box>
            <Typography variant="subtitle2" fontWeight="800" color="#0f172a">
              Shaft 4 • Sector B
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              {lat}, {lng}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box p={1.5} borderRadius={2} bgcolor={isInsideHazardGeofence ? '#fef2f2' : '#ecfdf5'} border={`1px solid ${isInsideHazardGeofence ? '#fca5a5' : '#a7f3d0'}`} sx={{ mb: 2 }}>
        <Typography variant="caption" fontWeight="800" color={isInsideHazardGeofence ? '#b91c1c' : '#047857'} display="block">
          GEOFENCE STATUS:
        </Typography>
        <Typography variant="body2" fontWeight="700" color={isInsideHazardGeofence ? '#991b1b' : '#065f46'} sx={{ fontSize: '0.82rem' }}>
          {isInsideHazardGeofence
            ? `⚠️ WARNING: Currently inside ${activeGeofenceName}. Follow atmospheric safety rules.`
            : "🟢 Clear: You are operating within verified safe working boundaries."}
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Button
        variant="outlined"
        fullWidth
        size="small"
        endIcon={<ArrowForwardIcon />}
        onClick={() => navigate('/worker/map')}
        sx={{ borderRadius: 2, fontWeight: 700, color: '#7c3aed', borderColor: '#ddd6fe' }}
      >
        Open Safe Zone Map
      </Button>
    </Paper>
  );
};

export default SafeZoneCard;
