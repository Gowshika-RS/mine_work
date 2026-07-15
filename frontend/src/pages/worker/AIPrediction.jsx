import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress, Chip, Alert, Divider, CircularProgress } from '@mui/material';
import { Thermostat, Opacity, Air, GasMeter, ReportProblem, Sensors, Psychology, History } from '@mui/icons-material';
import apiClient from '../../api/client';

export const AIPrediction = () => {
  const [telemetryData, setTelemetryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [historyLog, setHistoryLog] = useState([]);

  const fetchTelemetry = async () => {
    try {
      const response = await apiClient.get('/ml/realtime-telemetry');
      setTelemetryData(response.data);
      setError('');
      
      const newEntry = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        methane: response.data.telemetry.methane_level,
        co: response.data.telemetry.co_level,
        temp: response.data.telemetry.temperature,
        status: response.data.prediction.risk_status
      };
      setHistoryLog(prev => [newEntry, ...prev].slice(0, 5));
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Telemetry connection failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    // Refresh telemetry every 6 seconds to show dynamic sensor fluctuations
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'safe': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="textSecondary">Connecting to AI sensor telemetry...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Psychology color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>AI Telemetry Dashboard</Typography>
            <Typography variant="body2" color="textSecondary">Real-time underground atmospheric predictions</Typography>
          </Box>
        </Box>
        <Chip 
          icon={<Sensors />} 
          label="Live Stream Connected" 
          color="success" 
          variant="outlined" 
          sx={{ fontWeight: 'bold', animation: 'pulse 2s infinite' }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {telemetryData && (
        <Grid container spacing={3}>
          {/* Main Predictor Assessment */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>AI Hazard Risk Assessment</Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, bgcolor: `${getStatusColor(telemetryData.prediction.risk_status)}.light`, borderRadius: 4, mb: 3, color: '#fff' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 'bold' }}>STATUS</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'black', letterSpacing: 1 }}>
                      {telemetryData.prediction.risk_status.toUpperCase()}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 'bold' }}>CONFIDENCE</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'black' }}>
                      {telemetryData.prediction.probability}%
                    </Typography>
                  </Box>
                </Box>

                <Alert severity={getStatusColor(telemetryData.prediction.risk_status)} sx={{ borderRadius: 3, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>Safety Recommendations:</Typography>
                  <Typography variant="body2">{telemetryData.prediction.recommendation}</Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          {/* Environmental Conditions Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>General Status</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary">Risk Level Index</Typography>
                    <Chip label={`Level ${telemetryData.prediction.risk_level}`} color={getStatusColor(telemetryData.prediction.risk_status)} size="small" sx={{ fontWeight: 'bold' }} />
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="textSecondary" display="block">Primary Threat Analysis</Typography>
                    <Typography variant="body2" sx={{ fontWeight: '500', mt: 0.5 }}>
                      {telemetryData.prediction.risk_status === 'Safe' 
                        ? 'No critical atmospheric limits exceeded' 
                        : 'Atmospheric telemetry contains elevated toxic or flammable gas counts.'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sensor Telemetry Dials */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Sensor Measurements</Typography>
            <Grid container spacing={2}>
              {/* Methane */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 3 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GasMeter sx={{ color: 'error.main' }} />
                        <Typography variant="subtitle2" fontWeight="bold">Methane (CH₄)</Typography>
                      </Box>
                      <Chip label={telemetryData.telemetry.methane_level >= 2.0 ? 'CRITICAL' : telemetryData.telemetry.methane_level >= 1.0 ? 'WARNING' : 'NORMAL'} size="small" color={telemetryData.telemetry.methane_level >= 2.0 ? 'error' : telemetryData.telemetry.methane_level >= 1.0 ? 'warning' : 'success'} sx={{ fontSize: '10px', height: 20 }} />
                    </Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>{telemetryData.telemetry.methane_level} %</Typography>
                    <LinearProgress variant="determinate" value={Math.min(100, (telemetryData.telemetry.methane_level / 5.0) * 100)} color={telemetryData.telemetry.methane_level >= 2.0 ? 'error' : telemetryData.telemetry.methane_level >= 1.0 ? 'warning' : 'primary'} sx={{ height: 6, borderRadius: 3 }} />
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>Danger Limit: 2.0% (Explosive threshold)</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* CO */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 3 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReportProblem sx={{ color: 'warning.main' }} />
                        <Typography variant="subtitle2" fontWeight="bold">Carbon Monoxide (CO)</Typography>
                      </Box>
                      <Chip label={telemetryData.telemetry.co_level >= 50.0 ? 'CRITICAL' : telemetryData.telemetry.co_level >= 25.0 ? 'WARNING' : 'NORMAL'} size="small" color={telemetryData.telemetry.co_level >= 50.0 ? 'error' : telemetryData.telemetry.co_level >= 25.0 ? 'warning' : 'success'} sx={{ fontSize: '10px', height: 20 }} />
                    </Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>{telemetryData.telemetry.co_level} ppm</Typography>
                    <LinearProgress variant="determinate" value={Math.min(100, (telemetryData.telemetry.co_level / 100.0) * 100)} color={telemetryData.telemetry.co_level >= 50.0 ? 'error' : telemetryData.telemetry.co_level >= 25.0 ? 'warning' : 'primary'} sx={{ height: 6, borderRadius: 3 }} />
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>Danger Limit: 50.0 ppm (Toxicity threshold)</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Temperature */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 3 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Thermostat sx={{ color: 'error.main' }} />
                        <Typography variant="subtitle2" fontWeight="bold">Shaft Temperature</Typography>
                      </Box>
                      <Chip label={telemetryData.telemetry.temperature >= 38.0 ? 'CRITICAL' : telemetryData.telemetry.temperature >= 33.0 ? 'WARNING' : 'NORMAL'} size="small" color={telemetryData.telemetry.temperature >= 38.0 ? 'error' : telemetryData.telemetry.temperature >= 33.0 ? 'warning' : 'success'} sx={{ fontSize: '10px', height: 20 }} />
                    </Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>{telemetryData.telemetry.temperature} °C</Typography>
                    <LinearProgress variant="determinate" value={Math.min(100, (telemetryData.telemetry.temperature / 50.0) * 100)} color={telemetryData.telemetry.temperature >= 38.0 ? 'error' : telemetryData.telemetry.temperature >= 33.0 ? 'warning' : 'primary'} sx={{ height: 6, borderRadius: 3 }} />
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>Danger Limit: 38.0 °C (Extreme Heat Stress)</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Humidity */}
              <Grid item xs={12} sm={6} md={6}>
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 3 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Opacity sx={{ color: 'info.main' }} />
                      <Typography variant="subtitle2" fontWeight="bold">Relative Humidity</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>{telemetryData.telemetry.humidity} %</Typography>
                    <LinearProgress variant="determinate" value={telemetryData.telemetry.humidity} color="info" sx={{ height: 6, borderRadius: 3 }} />
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>Comfortable Range: 30% - 70%</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Air Velocity */}
              <Grid item xs={12} sm={12} md={6}>
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 3 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Air sx={{ color: 'success.main' }} />
                        <Typography variant="subtitle2" fontWeight="bold">Air Velocity</Typography>
                      </Box>
                      <Chip label={telemetryData.telemetry.air_velocity <= 0.3 ? 'CRITICAL' : telemetryData.telemetry.air_velocity <= 0.6 ? 'WARNING' : 'NORMAL'} size="small" color={telemetryData.telemetry.air_velocity <= 0.3 ? 'error' : telemetryData.telemetry.air_velocity <= 0.6 ? 'warning' : 'success'} sx={{ fontSize: '10px', height: 20 }} />
                    </Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>{telemetryData.telemetry.air_velocity} m/s</Typography>
                    <LinearProgress variant="determinate" value={Math.min(100, (telemetryData.telemetry.air_velocity / 3.0) * 100)} color={telemetryData.telemetry.air_velocity <= 0.3 ? 'error' : telemetryData.telemetry.air_velocity <= 0.6 ? 'warning' : 'primary'} sx={{ height: 6, borderRadius: 3 }} />
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>Min Required: 0.3 m/s (Ventilation flow)</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Historical Log */}
          {historyLog.length > 0 && (
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <History /> Live Telemetry Event Log (Fluctuations)
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {historyLog.map((log, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#fbfbfb', borderRadius: 2, borderLeft: `4px solid`, borderColor: `${getStatusColor(log.status)}.main` }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>{log.time}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            CH₄: {log.methane}% | CO: {log.co}ppm | Temp: {log.temp}°C
                          </Typography>
                        </Box>
                        <Chip label={log.status.toUpperCase()} color={getStatusColor(log.status)} size="small" sx={{ fontSize: '10px', fontWeight: 'bold', height: 18 }} />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};
