import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Alert, CircularProgress, Grid, Divider, Chip } from '@mui/material';
import apiClient from '../api/client';
import WarningIcon from '@mui/icons-material/Warning';
import DangerousIcon from '@mui/icons-material/Dangerous';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SensorsIcon from '@mui/icons-material/Sensors';
import PsychologyIcon from '@mui/icons-material/Psychology';

export const RiskLevelCard = () => {
  const [riskData, setRiskData] = useState(null);
  const [mlData, setMlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mlError, setMlError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRiskLevel();
    fetchMlPrediction();

    const intervalRisk = setInterval(fetchRiskLevel, 30000);
    const intervalMl = setInterval(fetchMlPrediction, 20000);

    return () => {
      clearInterval(intervalRisk);
      clearInterval(intervalMl);
    };
  }, []);

  const fetchRiskLevel = async () => {
    try {
      setRefreshing(true);
      const response = await apiClient.get('/safety/risk-level');
      setRiskData(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch risk level');
      setRiskData({
        risk_level: 'unknown',
        risk_score: 0,
        description: 'Unable to calculate risk level',
        color: '#9e9e9e',
        factors: [],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMlPrediction = async () => {
    try {
      const response = await apiClient.get('/ml/realtime-telemetry');
      setMlData(response.data);
      setMlError('');
    } catch (err) {
      setMlError(err.response?.data?.detail || err.message || 'Failed to fetch ML telemetry');
    }
  };

  const getRiskIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'low':
      case 'safe':
        return <CheckCircleIcon sx={{ fontSize: 30, color: '#4caf50' }} />;
      case 'medium':
      case 'warning':
        return <WarningIcon sx={{ fontSize: 30, color: '#ff9800' }} />;
      case 'high':
      case 'critical':
        return <DangerousIcon sx={{ fontSize: 30, color: '#f44336' }} />;
      default:
        return <WarningIcon sx={{ fontSize: 30, color: '#9e9e9e' }} />;
    }
  };

  const getMlColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'safe': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'critical': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Rule-Based Risk Card */}
      {riskData && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Current Risk Level (Profile)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getRiskIcon(riskData.risk_level)}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: riskData.color || '#9e9e9e',
                    textTransform: 'capitalize',
                  }}
                >
                  {riskData.risk_level}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body1" sx={{ mb: 2 }}>
              {riskData.description}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Risk Score</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {riskData.risk_score}/100
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={riskData.risk_score}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: riskData.color || '#9e9e9e',
                    borderRadius: 4,
                  },
                }}
              />
            </Box>

            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Risk Factors */}
            {riskData.factors && riskData.factors.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Contributing Factors:
                </Typography>
                <Grid container spacing={1}>
                  {riskData.factors.map((factor, idx) => (
                    <Grid item xs={12} key={idx}>
                      <Box
                        sx={{
                          p: 1,
                          backgroundColor:
                            factor.weight === 'critical'
                              ? '#ffebee'
                              : factor.weight === 'high'
                              ? '#fff3e0'
                              : factor.weight === 'positive'
                              ? '#e8f5e9'
                              : '#f5f5f5',
                          borderLeft: `3px solid ${
                            factor.weight === 'critical'
                              ? '#f44336'
                              : factor.weight === 'high'
                              ? '#ff9800'
                              : factor.weight === 'positive'
                              ? '#4caf50'
                              : '#9e9e9e'
                          }`,
                          borderRadius: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {factor.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                factor.impact > 0
                                  ? '#f44336'
                                  : factor.impact < 0
                                  ? '#4caf50'
                                  : '#9e9e9e',
                              fontWeight: 'bold',
                            }}
                          >
                            {factor.impact > 0 ? '+' : ''}{factor.impact}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {factor.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Real-time Telemetry Prediction Card */}
      <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PsychologyIcon sx={{ color: '#673ab7' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                AI Hazard Predictor
              </Typography>
            </Box>
            <Chip 
              icon={<SensorsIcon />} 
              label="Live Telemetry" 
              color="secondary" 
              size="small" 
              variant="outlined" 
            />
          </Box>

          {mlError && <Alert severity="error" sx={{ mb: 2 }}>{mlError}</Alert>}

          {mlData ? (
            <Grid container spacing={2}>
              {/* Telemetry Sensor Readings */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary' }}>
                  Real-time Environmental Sensors:
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="textSecondary">Methane (CH₄)</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{mlData.telemetry.methane_level}%</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="textSecondary">Carbon Monoxide</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{mlData.telemetry.co_level} ppm</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="textSecondary">Temperature</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{mlData.telemetry.temperature}°C</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={6}>
                    <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="textSecondary">Humidity</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{mlData.telemetry.humidity}%</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="textSecondary">Air Velocity</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{mlData.telemetry.air_velocity} m/s</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              {/* ML Prediction Result */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                    Prediction Assessment:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getRiskIcon(mlData.prediction.risk_status)}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: getMlColor(mlData.prediction.risk_status)
                      }}
                    >
                      {mlData.prediction.risk_status} ({mlData.prediction.probability}%)
                    </Typography>
                  </Box>
                </Box>
                
                <Alert 
                  severity={
                    mlData.prediction.risk_status === 'Critical' 
                      ? 'error' 
                      : mlData.prediction.risk_status === 'Warning' 
                      ? 'warning' 
                      : 'success'
                  }
                  sx={{ mt: 1 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    AI Recommendations:
                  </Typography>
                  <Typography variant="body2">
                    {mlData.prediction.recommendation}
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </CardContent>
      </Card>

      {riskData && riskData.risk_level === 'critical' && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          <Typography sx={{ fontWeight: 'bold' }}>CRITICAL RISK DETECTED</Typography>
          Your current risk level is critical. Please seek immediate assistance from your supervisor or emergency services.
        </Alert>
      )}
      {riskData && riskData.risk_level === 'high' && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Your current risk level is high. Take all necessary precautions and follow safety protocols.
        </Alert>
      )}
    </>
  );
};
