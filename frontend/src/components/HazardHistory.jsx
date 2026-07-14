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
} from '@mui/material';
import axios from 'axios';

export const HazardHistory = () => {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHazards();
  }, []);

  const fetchHazards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/hazards/', {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Hazard Report History
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {hazards.length === 0 ? (
          <Alert severity="info">No hazard reports yet. Your safety record is good!</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell align="center"><strong>Severity</strong></TableCell>
                  <TableCell align="center"><strong>Status</strong></TableCell>
                  <TableCell sx={{ maxWidth: 200 }}><strong>Description</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hazards.map((hazard) => (
                  <TableRow key={hazard.id} hover>
                    <TableCell>{formatDate(hazard.created_at)}</TableCell>
                    <TableCell>{hazard.hazard_type}</TableCell>
                    <TableCell>{hazard.location}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={hazard.severity}
                        size="small"
                        color={getSeverityColor(hazard.severity)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={hazard.status?.replace('_', ' ')}
                        size="small"
                        color={getStatusColor(hazard.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
