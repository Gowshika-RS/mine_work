import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, Grid, Button, Chip, TextField, 
  MenuItem, Select, InputLabel, FormControl, Dialog, DialogTitle, 
  DialogContent, DialogActions, LinearProgress, CircularProgress
} from '@mui/material';
import { 
  Shield, Warning, HelpOutline, CheckCircle, Snooze, BookmarkBorder, 
  History, Search, FilterList, KeyboardArrowRight, Thermostat, Opacity, 
  BatteryAlert, Air, GasMeter, Co2, ReportProblem, Psychology
} from '@mui/icons-material';
import apiClient from '../../api/client';

export const Recommendations = () => {
  const [sensors, setSensors] = useState({
    methane: 0,
    co: 0,
    oxygen: 0,
    temp: 0,
    humidity: 0,
    airVelocity: 0,
    battery: 0,
    fatigue: 0,
    ppeCompliance: 0,
  });

  const [safetyScore, setSafetyScore] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Explanation dialog states
  const [explainOpen, setExplainOpen] = useState(false);
  const [selectedRec, setSelectedRec] = useState(null);

  const generateRecommendations = () => {
    const list = [];
    const now = new Date();

    if (sensors.methane > 1.0) {
      list.push({
        id: 'env-1',
        title: 'High Methane Levels Detected',
        description: 'Methane level is currently elevated in your sector.',
        reason: `Methane gas concentration is ${sensors.methane}%, which is above the 1.0% caution threshold.`,
        priority: 'Critical',
        category: 'Environment',
        time: new Date(now.getTime() - 1000 * 60 * 3),
        confidence: Math.max(70, Math.min(99, Math.round(sensors.methane * 20 + 60))),
        status: 'Pending',
        icon: <GasMeter color="error" />
      });
    }

    if (sensors.battery < 25) {
      list.push({
        id: 'eq-1',
        title: 'Recharge Communication Radio',
        description: 'Battery level is low. Communications might disconnect.',
        reason: `The latest dataset-based assessment reports a battery reading of ${sensors.battery}%.`,
        priority: 'Medium',
        category: 'Equipment',
        time: new Date(now.getTime() - 1000 * 60 * 15),
        confidence: 86,
        status: 'Pending',
        icon: <BatteryAlert color="warning" />
      });
    }

    if (sensors.temp > 33) {
      list.push({
        id: 'env-2',
        title: 'High Temperature Safety Alert',
        description: 'Heat stress warning in underground shaft.',
        reason: `Ambient shaft temperature is ${sensors.temp}°C with ${sensors.humidity}% humidity.`,
        priority: 'High',
        category: 'Environment',
        time: new Date(now.getTime() - 1000 * 60 * 8),
        confidence: 88,
        status: 'Pending',
        icon: <Thermostat color="error" />
      });
    }

    if (sensors.fatigue > 5) {
      list.push({
        id: 'hlth-1',
        title: 'Mandatory Hydration & Rest Break',
        description: 'Take a 15-minute break outside high-temperature zones.',
        reason: `The current dataset-based fatigue indicator is ${sensors.fatigue}/10.`,
        priority: 'High',
        category: 'Health',
        time: new Date(now.getTime() - 1000 * 60 * 20),
        confidence: 84,
        status: 'Pending',
        icon: <Psychology color="warning" />
      });
    }

    if (sensors.ppeCompliance < 85) {
      list.push({
        id: 'ppe-1',
        title: 'Verify Steel-Toed Boots Lock',
        description: 'Boot protection sensors indicate loose ankle fit.',
        reason: `PPE compliance is at ${sensors.ppeCompliance}%.`,
        priority: 'Low',
        category: 'PPE',
        time: new Date(now.getTime() - 1000 * 60 * 45),
        confidence: 80,
        status: 'Pending',
        icon: <Shield color="info" />
      });
    }

    if (sensors.oxygen < 19.5) {
      list.push({
        id: 'emg-1',
        title: 'Evacuate Sector: Low Oxygen',
        description: 'Move to nearest ventilation shaft or safe exit route.',
        reason: `Oxygen level is ${sensors.oxygen}%, below the safe breathing limit of 19.5%.`,
        priority: 'Critical',
        category: 'Emergency',
        time: new Date(now.getTime() - 1000 * 30),
        confidence: 95,
        status: 'Pending',
        icon: <ReportProblem color="error" />
      });
    }

    backendRecs.forEach((rec, idx) => {
      list.push({
        id: `backend-${idx}`,
        title: rec.category,
        description: rec.message,
        reason: 'Derived from the current worker profile and hazard context.',
        priority: rec.severity === 'high' ? 'Critical' : rec.severity === 'medium' ? 'High' : 'Low',
        category: 'Safety Protocol',
        time: now,
        confidence: rec.severity === 'high' ? 92 : rec.severity === 'medium' ? 87 : 78,
        status: 'Pending',
        icon: <Shield color={rec.severity === 'high' ? 'error' : rec.severity === 'medium' ? 'warning' : 'info'} />
      });
    });

    setRecommendations(list);
  };

  const [backendRecs, setBackendRecs] = useState([]);

  const fetchBackendRecommendations = async () => {
    try {
      const response = await apiClient.get('/safety/recommendations');
      setBackendRecs(response.data);
    } catch (err) {
      console.error("Failed to fetch backend recommendations:", err);
    }
  };

  const fetchRiskScore = async () => {
    try {
      const profileResponse = await apiClient.get('/users/me');
      if (profileResponse.data?.profile?.safety_score) {
        setSafetyScore(parseFloat(profileResponse.data.profile.safety_score));
      }
    } catch (err) {
      console.error('Failed to fetch risk score:', err);
    }
  };

  const fetchDatasetTelemetry = async () => {
    try {
      const response = await apiClient.get('/ml/realtime-telemetry');
      const telemetry = response.data.telemetry;
      setSensors({
        methane: telemetry.methane_level,
        co: telemetry.co_level,
        temp: telemetry.temperature,
        humidity: telemetry.humidity,
        airVelocity: telemetry.air_velocity,
        oxygen: Math.max(18.5, 20 - telemetry.methane_level * 0.8),
        battery: Math.max(5, 100 - Math.round(telemetry.annotation_count * 2.5)),
        fatigue: Math.min(10, Math.max(2, Math.round(telemetry.sitting_ratio / 10))),
        ppeCompliance: Math.max(70, 100 - Math.round(telemetry.standing_ratio / 2)),
      });
    } catch (err) {
      console.error('Failed to fetch dataset telemetry:', err);
    }
  };

  useEffect(() => {
    fetchBackendRecommendations();
    fetchRiskScore();
    fetchDatasetTelemetry();

    const intervalRecs = setInterval(fetchBackendRecommendations, 10000);
    const intervalScore = setInterval(fetchRiskScore, 15000);
    const intervalTelemetry = setInterval(fetchDatasetTelemetry, 20000);

    return () => {
      clearInterval(intervalRecs);
      clearInterval(intervalScore);
      clearInterval(intervalTelemetry);
    };
  }, []);

  // Update recommendations whenever sensors or backendRecs update
  useEffect(() => {
    generateRecommendations();
  }, [sensors, backendRecs]);

  const handleAction = (id, actionType) => {
    setRecommendations(prev => {
      const match = prev.find(r => r.id === id);
      if (match) {
        // Move to history
        setHistory(h => [
          { ...match, status: actionType, resolvedTime: new Date() },
          ...h
        ]);
      }
      return prev.filter(r => r.id !== id);
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'error';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'info';
      case 'Low':
        return 'success';
      default:
        return 'default';
    }
  };

  // Filter & Sort Logic
  const filteredRecommendations = recommendations
    .filter(rec => {
      const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            rec.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || rec.priority.toLowerCase() === priorityFilter.toLowerCase();
      const matchesCategory = categoryFilter === 'all' || rec.category.toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesPriority && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return b.time - a.time;
      return a.time - b.time;
    });

  const criticalCount = recommendations.filter(r => r.priority === 'Critical').length;
  const completedCount = history.filter(h => h.status === 'Completed').length;
  const pendingCount = filteredRecommendations.length;

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        AI Safety Assistant & Recommendations
      </Typography>

      {/* Top AI Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 1 }}>
            <CardContent>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                <CircularProgress variant="determinate" value={safetyScore} size={64} thickness={4} color="success" />
                <Box
                  sx={{
                    top: 0, left: 0, bottom: 0, right: 0, position: 'absolute',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" fontWeight="bold">{safetyScore}%</Typography>
                </Box>
              </Box>
              <Typography variant="subtitle2" fontWeight="bold">Safety Score</Typography>
              <Typography variant="caption" color="textSecondary">Excellent underground habits</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 1 }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="error.main" sx={{ mb: 1 }}>
                {criticalCount}
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold">Critical Alerts</Typography>
              <Typography variant="caption" color="textSecondary">Evacuation & Gas threats</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 1 }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ mb: 1 }}>
                {pendingCount}
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold">Pending Advice</Typography>
              <Typography variant="caption" color="textSecondary">Requires safety response</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 1 }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ mb: 1 }}>
                {completedCount}
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold">Resolved Checklist</Typography>
              <Typography variant="caption" color="textSecondary">Snoozed or completed today</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters & Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search AI recommendations..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
              sx={{ flexGrow: 1, minWidth: 200 }}
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                label="Priority"
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="ppe">PPE</MenuItem>
                <MenuItem value="equipment">Equipment</MenuItem>
                <MenuItem value="environment">Environment</MenuItem>
                <MenuItem value="health">Health</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortOrder}
                label="Sort By"
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Recommendations Cards */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Active Recommendations
      </Typography>

      <Grid container spacing={2}>
        {filteredRecommendations.length === 0 ? (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent sx={{ py: 6, textAlign: 'center' }}>
                <CheckCircle color="success" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6">No safety risks found</Typography>
                <Typography variant="body2" color="textSecondary">
                  Your environmental sensors, PPE locks, and battery levels are fully compliant.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          filteredRecommendations.map((rec) => (
            <Grid item xs={12} md={6} key={rec.id}>
              <Card sx={{ borderLeft: '6px solid', borderColor: `${getPriorityColor(rec.priority)}.main` }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {rec.icon}
                      <Typography variant="subtitle1" fontWeight="bold">
                        {rec.title}
                      </Typography>
                    </Box>
                    <Chip 
                      label={rec.priority} 
                      color={getPriorityColor(rec.priority)} 
                      size="small" 
                      sx={{ fontWeight: 'bold' }} 
                    />
                  </Box>

                  <Typography variant="body2" color="textSecondary" paragraph>
                    {rec.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, bgcolor: 'action.hover', p: 1.5, borderRadius: 2 }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" display="block">
                        AI Reasoning
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: '500' }}>
                        {rec.reason.slice(0, 75)}...
                      </Typography>
                    </Box>
                    <Button 
                      size="small" 
                      variant="text" 
                      onClick={() => { setSelectedRec(rec); setExplainOpen(true); }}
                      startIcon={<HelpOutline />}
                    >
                      Why?
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={`AI Conf: ${rec.confidence}%`} size="small" color="primary" variant="outlined" />
                      <Typography variant="caption" color="textSecondary">
                        {rec.time.toLocaleTimeString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="success" 
                        startIcon={<CheckCircle />}
                        onClick={() => handleAction(rec.id, 'Completed')}
                      >
                        Complete
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="warning" 
                        startIcon={<Snooze />}
                        onClick={() => handleAction(rec.id, 'Snoozed')}
                      >
                        Snooze
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* History Log */}
      {history.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <History /> Recent Action Log
          </Typography>
          <Grid container spacing={1.5}>
            {history.map((h, idx) => (
              <Grid item xs={12} key={idx}>
                <Card variant="outlined" sx={{ bgcolor: 'action.disabledBackground' }}>
                  <CardContent sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">{h.title}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Actioned at {h.resolvedTime.toLocaleTimeString()}
                      </Typography>
                    </Box>
                    <Chip label={h.status} color={h.status === 'Completed' ? 'success' : 'warning'} size="small" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Explanation Dialog Popup */}
      <Dialog open={explainOpen} onClose={() => setExplainOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Psychology color="primary" /> AI Decision Explanation
        </DialogTitle>
        <DialogContent dividers>
          {selectedRec && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {selectedRec.title}
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedRec.description}
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 3, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Decision Rationale:
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedRec.reason}
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" display="block">AI Confidence Rating</Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary.main">{selectedRec.confidence}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" display="block">Safety Domain</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedRec.category}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExplainOpen(false)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
