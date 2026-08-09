import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import apiClient from '../api/client';

export const HazardHistory = () => {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHazards();
  }, []);

  const fetchHazards = async () => {
    try {
      const response = await apiClient.get('/hazards/');
      setHazards(response.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load hazards');
      setHazards([]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'error';
      case 'under_review':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMediaUrl = (urlPath) => {
    if (!urlPath) return '';
    if (urlPath.startsWith('http')) return urlPath;
    return `http://127.0.0.1:8000${urlPath}`;
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
    <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          📋 Reported Hazard Log
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {hazards.length === 0 ? (
          <Alert severity="info">No hazard reports recorded yet.</Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Date & Time</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell align="center"><strong>Severity</strong></TableCell>
                  <TableCell align="center"><strong>Status</strong></TableCell>
                  <TableCell><strong>Voice Note / Media</strong></TableCell>
                  <TableCell sx={{ maxWidth: 200 }}><strong>Description</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hazards.map((hazard) => (
                  <TableRow key={hazard.id} hover>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{formatDate(hazard.created_at)}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{hazard.hazard_type}</TableCell>
                    <TableCell>{hazard.location}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={hazard.severity?.toUpperCase()}
                        size="small"
                        color={getSeverityColor(hazard.severity)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={hazard.status?.replace('_', ' ').toUpperCase()}
                        size="small"
                        color={getStatusColor(hazard.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {hazard.audio_url && (
                        <audio controls src={getMediaUrl(hazard.audio_url)} style={{ height: '32px', maxWidth: '180px' }} />
                      )}
                      {hazard.images && hazard.images.length > 0 && (
                        <Box sx={{ mt: 0.5 }}>
                          <img
                            src={getMediaUrl(hazard.images[0].image_url)}
                            alt="Hazard"
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        </Box>
                      )}
                      {!hazard.audio_url && (!hazard.images || hazard.images.length === 0) && (
                        <Typography variant="caption" color="text.secondary">Text only</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {hazard.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default HazardHistory;
