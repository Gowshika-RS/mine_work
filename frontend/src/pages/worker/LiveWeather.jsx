import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Grid,
  Paper, Alert, Chip, CircularProgress, Divider, Stack, Button
} from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SpeedIcon from '@mui/icons-material/Speed';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import apiClient from '../../api/client';

export const LiveWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ lat: 12.9716, lon: 77.5946 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setLocation(loc);
          fetchWeather(loc.lat, loc.lon);
        },
        () => fetchWeather(12.9716, 77.5946)
      );
    } else {
      fetchWeather(12.9716, 77.5946);
    }

    // Auto-refresh weather every 15 minutes
    const interval = setInterval(() => {
      fetchWeather(location.lat, location.lon);
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/weather/current?lat=${lat}&lon=${lon}`);
      setWeatherData(res.data);
    } catch (err) {
      console.error("Weather fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };


  const getAQILabel = (aqi) => {
    if (aqi <= 50) return { label: 'Good (Healthy)', color: 'success' };
    if (aqi <= 100) return { label: 'Moderate', color: 'info' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 'warning' };
    return { label: 'Hazardous (Poor AQI)', color: 'error' };
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            🌦️ Mine Meteorological Station & Weather Alert
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Real-time weather tracking, humidity, rain probability, wind speed, and air quality index (AQI) with automated severe condition alerts.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchWeather(location.lat, location.lon)}
          sx={{ borderRadius: 2, fontWeight: 'bold' }}
        >
          Refresh Now
        </Button>
      </Box>

      {loading && !weatherData && (
        <Box textAlign="center" py={8}>
          <CircularProgress size={50} />
          <Typography variant="body1" sx={{ mt: 2 }} fontWeight="bold">Fetching live weather telemetry...</Typography>
        </Box>
      )}

      {weatherData && (
        <>
          {/* Active Severe Weather Warnings Banner */}
          {weatherData.warnings && weatherData.warnings.length > 0 && (
            <Stack spacing={1} sx={{ mb: 4 }}>
              {weatherData.warnings.map((warn, index) => (
                <Alert key={index} severity="warning" icon={<WarningAmberIcon />} sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  {warn}
                </Alert>
              ))}
            </Stack>
          )}

          {/* Hero Weather Card */}
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
              color: '#ffffff',
              boxShadow: 6,
              mb: 4
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={1} sx={{ opacity: 0.9 }}>
                  <LocationOnIcon />
                  <Typography variant="h6" fontWeight="bold">
                    {weatherData.location_name}
                  </Typography>
                </Box>
                <Typography variant="h1" fontWeight="900" sx={{ my: 1, letterSpacing: -2 }}>
                  {weatherData.temperature}°C
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ opacity: 0.9 }}>
                  {weatherData.condition}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6} textAlign={{ xs: 'left', md: 'right' }}>
                <img
                  src={weatherData.icon}
                  alt={weatherData.condition}
                  style={{ width: '120px', height: '120px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}
                />
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={`Air Quality (AQI): ${weatherData.air_quality_index} - ${getAQILabel(weatherData.air_quality_index).label}`}
                    color={getAQILabel(weatherData.air_quality_index).color}
                    sx={{ fontWeight: 'bold', fontSize: '0.9rem', py: 2, px: 1 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Grid Metrics */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 3, textAlign: 'center', p: 1 }}>
                <CardContent>
                  <WaterDropIcon sx={{ fontSize: 40, color: '#0288d1', mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">
                    HUMIDITY
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {weatherData.humidity}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 3, textAlign: 'center', p: 1 }}>
                <CardContent>
                  <AirIcon sx={{ fontSize: 40, color: '#009688', mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">
                    WIND SPEED
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {weatherData.wind_speed} <Typography component="span" variant="body2">km/h</Typography>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 3, textAlign: 'center', p: 1 }}>
                <CardContent>
                  <WaterDropIcon sx={{ fontSize: 40, color: '#e91e63', mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">
                    RAIN PROBABILITY
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {weatherData.rain_probability}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 3, textAlign: 'center', p: 1 }}>
                <CardContent>
                  <SpeedIcon sx={{ fontSize: 40, color: '#7c4dff', mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">
                    ATMOSPHERIC PRESSURE
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {weatherData.pressure} <Typography component="span" variant="body2">hPa</Typography>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Sunrise / Sunset */}
          <Paper sx={{ p: 3, mt: 4, borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🌅 Solar Cycle & Shift Lighting Window
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={2}>
                  <WbSunnyIcon sx={{ fontSize: 40, color: '#ffb300' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Sunrise</Typography>
                    <Typography variant="h6" fontWeight="bold">{weatherData.sunrise}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={2}>
                  <WbTwilightIcon sx={{ fontSize: 40, color: '#f57c00' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Sunset</Typography>
                    <Typography variant="h6" fontWeight="bold">{weatherData.sunset}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Container>
  );
};
