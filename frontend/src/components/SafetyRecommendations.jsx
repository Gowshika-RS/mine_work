import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import axios from 'axios';

export const SafetyRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendations();
    const interval = setInterval(fetchRecommendations, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/safety/recommendations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecommendations(response.data || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError('Failed to load safety recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      case 'medium':
        return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'low':
        return <InfoIcon sx={{ color: '#2196f3' }} />;
      default:
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'success';
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
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <CheckCircleIcon sx={{ fontSize: 32, color: '#4caf50' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Safety Recommendations
          </Typography>
        </Box>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {recommendations.length === 0 ? (
          <Alert severity="success">
            No specific safety issues detected. Keep up the good work and continue following standard safety protocols.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {recommendations.map((rec, idx) => (
              <Grid item xs={12} key={idx}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    backgroundColor:
                      rec.severity?.toLowerCase() === 'high'
                        ? '#ffebee'
                        : rec.severity?.toLowerCase() === 'medium'
                        ? '#fff3e0'
                        : '#e3f2fd',
                    borderLeft: `4px solid ${
                      rec.severity?.toLowerCase() === 'high'
                        ? '#f44336'
                        : rec.severity?.toLowerCase() === 'medium'
                        ? '#ff9800'
                        : '#2196f3'
                    }`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                    <Box sx={{ mt: 0.5 }}>
                      {getSeverityIcon(rec.severity)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {rec.category}
                        </Typography>
                        <Chip
                          label={rec.severity?.charAt(0).toUpperCase() + rec.severity?.slice(1)}
                          size="small"
                          color={getSeverityColor(rec.severity)}
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {rec.message}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}

            {/* Summary Stats */}
            {recommendations.length > 0 && (
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Recommendation Summary
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Critical Issues
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#f44336' }}>
                        {recommendations.filter((r) => r.severity?.toLowerCase() === 'high').length}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Warnings
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#ff9800' }}>
                        {recommendations.filter((r) => r.severity?.toLowerCase() === 'medium').length}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Info
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#2196f3' }}>
                        {recommendations.filter((r) => r.severity?.toLowerCase() === 'low').length}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            )}

            {/* Action Items */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Alert severity="info">
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  🎯 Action Items:
                </Typography>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  <li>Review all safety recommendations regularly</li>
                  <li>Take immediate action on critical (high severity) items</li>
                  <li>Follow all standard safety protocols</li>
                  <li>Report any safety concerns immediately</li>
                  <li>Wear all required PPE at all times</li>
                </ul>
              </Alert>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};
