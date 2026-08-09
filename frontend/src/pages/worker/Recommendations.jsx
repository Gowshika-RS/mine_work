import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, Grid, Button, Chip, TextField, 
  MenuItem, Select, InputLabel, FormControl, Dialog, DialogTitle, 
  DialogContent, DialogActions, LinearProgress, CircularProgress, Paper, Stack, Divider
} from '@mui/material';
import { 
  Shield, Warning, HelpOutline, CheckCircle, Snooze, BookmarkBorder, 
  History, Search, FilterList, KeyboardArrowRight, Thermostat, Opacity, 
  BatteryAlert, Air, GasMeter, Co2, ReportProblem, Psychology, ArrowForward
} from '@mui/icons-material';
import apiClient from '../../api/client';

export const Recommendations = () => {
  const [sensors, setSensors] = useState({
    methane: 0.2,
    co: 5,
    oxygen: 20.9,
    temp: 34.2,
    humidity: 78,
    airVelocity: 3.5,
    battery: 85,
    fatigue: 4,
    ppeCompliance: 92,
  });

  const [safetyScore, setSafetyScore] = useState(98.5);
  const [recommendations, setRecommendations] = useState([]);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  
  const [explainOpen, setExplainOpen] = useState(false);
  const [selectedRec, setSelectedRec] = useState(null);
  const [backendRecs, setBackendRecs] = useState([]);

  const generateRecommendations = () => {
    const list = [];
    const now = new Date();

    // 1. Wear Helmet before entering Tunnel 2
    list.push({
      id: 'rec-tunnel-2',
      title: 'Wear Helmet Before Entering Tunnel 2',
      description: 'Mandatory hard hat requirement due to active rock drilling in Tunnel 2.',
      reason: 'Underground structural sensors reported active ceiling vibration in Tunnel 2.',
      recommended_action: 'Fasten chin-strap hard hat before crossing Sector B barrier.',
      priority: 'High',
      category: 'PPE',
      time: new Date(now.getTime() - 1000 * 60 * 2),
      confidence: 96,
      status: 'Pending',
      icon: <Shield color="primary" />
    });

    // 2. High Temperature extra water
    if (sensors.temp > 30) {
      list.push({
        id: 'rec-water-heat',
        title: 'Carry Additional Drinking Water',
        description: 'Ambient shaft temperature is elevated today.',
        reason: `Current temperature reading is ${sensors.temp}°C with ${sensors.humidity}% humidity. High heat stress risk.`,
        recommended_action: 'Carry minimum 1.5L insulated water canteen to lower shaft.',
        priority: 'High',
        category: 'Environment',
        time: new Date(now.getTime() - 1000 * 60 * 5),
        confidence: 94,
        status: 'Pending',
        icon: <Thermostat color="warning" />
      });
    }

    // 3. Avoid Blasting Zone between 2 PM and 4 PM
    list.push({
      id: 'rec-blasting-zone',
      title: 'Avoid Blasting Zone 3 (2:00 PM – 4:00 PM)',
      description: 'Scheduled explosive demolition in Sector C blasting chamber.',
      reason: 'Control Room scheduled controlled seismic blasting operation during afternoon shift.',
      recommended_action: 'Evacuate Sector C by 1:45 PM and remain at Refuge Chamber B.',
      priority: 'Critical',
      category: 'Emergency',
      time: new Date(now.getTime() - 1000 * 60 * 10),
      confidence: 99,
      status: 'Pending',
      icon: <Warning color="error" />
    });

    // 4. Complete PPE Checklist before starting work
    list.push({
      id: 'rec-ppe-check',
      title: 'Complete PPE Checklist Before Shift Entry',
      description: 'Ensure helmet, SCSR respirator, safety boots & vest are logged.',
      reason: 'AI Safety System mandates 100% pre-shift gear verification before shaft elevator release.',
      recommended_action: 'Open PPE Checklist module and complete face & gear verification.',
      priority: 'Medium',
      category: 'PPE',
      time: new Date(now.getTime() - 1000 * 60 * 15),
      confidence: 92,
      status: 'Pending',
      icon: <CheckCircle color="success" />
    });

    // 5. Contact Supervisor if Safety Score decreased
    if (safetyScore < 95) {
      list.push({
        id: 'rec-supervisor-contact',
        title: 'Contact Supervisor Regarding Safety Score',
        description: 'Your safety score index requires brief consultation.',
        reason: `Your safety compliance index updated to ${safetyScore}%. A brief sync with your Supervisor is recommended.`,
        recommended_action: 'Open Safety Chat or place direct hotline call to your Supervisor.',
        priority: 'Medium',
        category: 'Safety Protocol',
        time: new Date(now.getTime() - 1000 * 60 * 25),
        confidence: 88,
        status: 'Pending',
        icon: <ReportProblem color="info" />
      });
    }

    // Backend recommendations
    backendRecs.forEach((rec, idx) => {
      list.push({
        id: `backend-${idx}`,
        title: rec.category || 'Safety Telemetry Advice',
        description: rec.message || 'Follow standard operating safety procedures.',
        reason: 'Derived from real-time worker telemetry & hazard context.',
        recommended_action: 'Review instructions and acknowledge completion.',
        priority: rec.severity === 'high' ? 'Critical' : rec.severity === 'medium' ? 'High' : 'Low',
        category: 'Safety Protocol',
        time: now,
        confidence: rec.severity === 'high' ? 95 : 88,
        status: 'Pending',
        icon: <Shield color={rec.severity === 'high' ? 'error' : 'warning'} />
      });
    });

    setRecommendations(list);
  };

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

  useEffect(() => {
    fetchBackendRecommendations();
    fetchRiskScore();
  }, []);

  useEffect(() => {
    generateRecommendations();
  }, [sensors, backendRecs, safetyScore]);

  const handleAction = (id, actionType) => {
    setRecommendations(prev => {
      const match = prev.find(r => r.id === id);
      if (match) {
        setHistory(h => [{ ...match, status: actionType, resolvedTime: new Date() }, ...h]);
      }
      return prev.filter(r => r.id !== id);
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const filteredRecommendations = recommendations
    .filter(rec => {
      const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            rec.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || rec.priority.toLowerCase() === priorityFilter.toLowerCase();
      const matchesCategory = categoryFilter === 'all' || rec.category.toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesPriority && matchesCategory;
    })
    .sort((a, b) => sortOrder === 'newest' ? b.time - a.time : a.time - b.time);

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        🤖 AI Recommendation Engine
      </Typography>

      {/* Top AI Metrics Header */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 1, borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                <CircularProgress variant="determinate" value={safetyScore} size={64} thickness={4} color="success" />
                <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" fontWeight="bold">{safetyScore}%</Typography>
                </Box>
              </Box>
              <Typography variant="subtitle2" fontWeight="bold">Safety Score</Typography>
              <Typography variant="caption" color="textSecondary">Optimal Safety Index</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 1, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="error.main" sx={{ mb: 1 }}>
                {recommendations.filter(r => r.priority === 'Critical').length}
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold">Critical Warnings</Typography>
              <Typography variant="caption" color="textSecondary">Immediate action required</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 1, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ mb: 1 }}>
                {filteredRecommendations.length}
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold">Active AI Advice</Typography>
              <Typography variant="caption" color="textSecondary">Real-time suggestions</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 1, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ mb: 1 }}>
                {history.length}
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold">Resolved Today</Typography>
              <Typography variant="caption" color="textSecondary">Completed items</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters & Search */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search AI safety recommendations..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
              sx={{ flexGrow: 1, minWidth: 200 }}
            />

            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Priority</InputLabel>
              <Select value={priorityFilter} label="Priority" onChange={(e) => setPriorityFilter(e.target.value)}>
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Category</InputLabel>
              <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)}>
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="ppe">PPE</MenuItem>
                <MenuItem value="environment">Environment</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
                <MenuItem value="safety protocol">Safety Protocol</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortOrder} label="Sort By" onChange={(e) => setSortOrder(e.target.value)}>
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Recommendations Cards Grid */}
      <Grid container spacing={2.5}>
        {filteredRecommendations.map((rec) => (
          <Grid item xs={12} md={6} key={rec.id}>
            <Card sx={{ borderRadius: 3, borderLeft: '6px solid', borderColor: `${getPriorityColor(rec.priority)}.main`, boxShadow: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {rec.icon}
                    <Typography variant="subtitle1" fontWeight="bold">
                      {rec.title}
                    </Typography>
                  </Box>
                  <Chip label={rec.priority.toUpperCase()} color={getPriorityColor(rec.priority)} size="small" sx={{ fontWeight: 'bold' }} />
                </Box>

                <Typography variant="body2" color="textSecondary" paragraph>
                  {rec.description}
                </Typography>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#f9fbe7', mb: 2 }}>
                  <Typography variant="caption" color="primary.main" fontWeight="bold" display="block">
                    💡 Recommended AI Action:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {rec.recommended_action}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="textSecondary" display="block">
                    <strong>AI Reason:</strong> {rec.reason}
                  </Typography>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label={`AI Conf: ${rec.confidence}%`} size="small" color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />
                    <Typography variant="caption" color="textSecondary">
                      {rec.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>

                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleAction(rec.id, 'Completed')}
                      sx={{ borderRadius: 2, fontWeight: 'bold' }}
                    >
                      Acknowledge & Complete
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={<Snooze />}
                      onClick={() => handleAction(rec.id, 'Snoozed')}
                      sx={{ borderRadius: 2 }}
                    >
                      Snooze
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Action History Log */}
      {history.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <History /> Resolved Safety Action History
          </Typography>
          <Grid container spacing={1.5}>
            {history.map((h, idx) => (
              <Grid item xs={12} key={idx}>
                <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#fbfbfb' }}>
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
    </Box>
  );
};

export default Recommendations;
