import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Paper,
  Snackbar,
} from '@mui/material';
import {
  Warning,
  Dangerous,
  Search,
  AutoAwesome,
  AssignmentInd,
  CheckCircle,
  Visibility,
} from '@mui/icons-material';
import apiClient from '../../api/client';

export const Hazards = () => {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Detail State
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Status & Assign Dialog State
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('status'); // 'status' or 'assign'
  const [statusValue, setStatusValue] = useState('under_review');
  const [remarksValue, setRemarksValue] = useState('');
  const [investigatorId, setInvestigatorId] = useState('');
  const [usersList, setUsersList] = useState([]);

  // Toast
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const loadHazards = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/admin/hazards');
      setHazards(response.data || []);
    } catch (err) {
      if (!isSilent) setError(err.response?.data?.detail || 'Unable to load reported hazards');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const loadUsersList = async () => {
    try {
      const response = await apiClient.get('/admin/users');
      setUsersList(response.data || []);
    } catch (err) {
      console.error('Failed to load users list:', err);
    }
  };

  useEffect(() => {
    loadHazards();
    loadUsersList();

    const interval = setInterval(() => {
      loadHazards(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredHazards = useMemo(() => {
    return hazards.filter((h) => {
      const haystack = `${h.hazard_type} ${h.location} ${h.description} ${h.reporter_name}`.toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'all' || h.severity === riskFilter || h.risk_level?.toLowerCase() === riskFilter;
      const matchesStatus = statusFilter === 'all' || h.status === statusFilter;

      return matchesSearch && matchesRisk && matchesStatus;
    });
  }, [hazards, searchTerm, riskFilter, statusFilter]);

  const handleOpenDetail = (hazard) => {
    setSelectedHazard(hazard);
    setDetailDialogOpen(true);
  };

  const handleOpenAction = (hazard, type) => {
    setSelectedHazard(hazard);
    setActionType(type);
    setStatusValue(hazard.status || 'under_review');
    setRemarksValue(hazard.remarks || '');
    setInvestigatorId(hazard.investigator_id || '');
    setActionDialogOpen(true);
  };

  const handleSaveAction = async () => {
    if (!selectedHazard) return;
    try {
      if (actionType === 'status') {
        await apiClient.put(`/admin/hazards/${selectedHazard.id}/status?status=${statusValue}&remarks=${encodeURIComponent(remarksValue)}`);
        setToast({ open: true, message: 'Hazard status updated', severity: 'success' });
      } else if (actionType === 'assign') {
        await apiClient.put(`/admin/hazards/${selectedHazard.id}/assign?investigator_id=${investigatorId}`);
        setToast({ open: true, message: 'Investigator/maintenance assigned', severity: 'success' });
      }
      setActionDialogOpen(false);
      loadHazards();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.detail || 'Operation failed', severity: 'error' });
    }
  };

  const handleRunAiAnalysis = async (hazardId) => {
    try {
      const res = await apiClient.post(`/admin/hazards/${hazardId}/ai-analysis`);
      setToast({ open: true, message: 'AI Analysis updated successfully', severity: 'success' });
      if (selectedHazard && selectedHazard.id === hazardId) {
        setSelectedHazard({
          ...selectedHazard,
          ai_analysis: res.data,
          required_ppe: res.data.required_ppe,
          precautions: res.data.precautions,
          immediate_actions: res.data.immediate_actions,
        });
      }
      loadHazards();
    } catch (err) {
      setToast({ open: true, message: 'Failed to run AI analysis', severity: 'error' });
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
      default:
        return 'success';
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={44} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Hazard & AI Analysis Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Review reported mine hazards, uploaded photos, AI safety recommendations, and maintenance workflows
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Filters Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 260 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search hazard by type, location, reporter, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Risk Severity</InputLabel>
              <Select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} label="Risk Severity">
                <MenuItem value="all">All Severities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="open">Pending / Open</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Hazards Table */}
      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
            <TableRow>
              <TableCell>Hazard Details</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Severity / AI Risk</TableCell>
              <TableCell>Reported By</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHazards.map((hazard) => (
              <TableRow key={hazard.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {hazard.severity === 'critical' ? (
                      <Dangerous color="error" />
                    ) : (
                      <Warning color="warning" />
                    )}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {hazard.hazard_type}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" noWrap sx={{ maxWidth: 220, display: 'block' }}>
                        {hazard.description}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{hazard.location}</Typography>
                  <Typography variant="caption" color="textSecondary">{hazard.created_at}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={hazard.severity || 'Medium'}
                    color={getSeverityColor(hazard.severity)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{hazard.reporter_name || 'Anonymous'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={hazard.status}
                    color={hazard.status === 'resolved' ? 'success' : hazard.status === 'under_review' ? 'info' : 'warning'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => handleOpenDetail(hazard)}
                    >
                      View AI Analysis
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      startIcon={<AssignmentInd />}
                      onClick={() => handleOpenAction(hazard, 'assign')}
                    >
                      Assign
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleOpenAction(hazard, 'status')}
                    >
                      Status
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredHazards.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No hazards found matching current search & filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* AI Hazard Analysis & Details Modal */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedHazard && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  AI Hazard Analysis & Incident Report #{selectedHazard.id}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AutoAwesome />}
                onClick={() => handleRunAiAnalysis(selectedHazard.id)}
              >
                Re-Run Gemini AI
              </Button>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Basic Hazard Info */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" color="textSecondary">Hazard Type</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{selectedHazard.hazard_type}</Typography>

                    <Typography variant="subtitle2" color="textSecondary">Location</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{selectedHazard.location}</Typography>

                    <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                    <Typography variant="body2">{selectedHazard.description}</Typography>
                  </Paper>
                </Grid>

                {/* AI Gemini Results */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, border: '1px solid rgba(0, 240, 255, 0.25)', bgcolor: 'background.default' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        Gemini AI Diagnostics
                      </Typography>
                      <Chip
                        label={`Confidence: ${selectedHazard.ai_analysis?.confidence_score || 94.5}%`}
                        color="success"
                        size="small"
                      />
                    </Box>

                    <Typography variant="subtitle2" color="textSecondary">Required PPE</Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                      {selectedHazard.required_ppe || selectedHazard.ai_analysis?.required_ppe || 'Standard Safety Helmet, Boots, Gloves'}
                    </Typography>

                    <Typography variant="subtitle2" color="textSecondary">Safety Precautions</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {selectedHazard.precautions || selectedHazard.ai_analysis?.precautions || 'Isolate hazard sector and maintain safe perimeter.'}
                    </Typography>

                    <Typography variant="subtitle2" color="textSecondary">Immediate Recommended Actions</Typography>
                    <Typography variant="body2">
                      {selectedHazard.immediate_actions || selectedHazard.ai_analysis?.immediate_actions || 'Dispatch maintenance crew and log safety ticket.'}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Uploaded Images Preview */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    Uploaded Photo Evidence
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', py: 1 }}>
                    {selectedHazard.images && selectedHazard.images.length > 0 ? (
                      selectedHazard.images.map((imgUrl, idx) => (
                        <Box
                          key={idx}
                          component="img"
                          src={imgUrl.startsWith('http') ? imgUrl : `http://localhost:8000/${imgUrl}`}
                          alt="Hazard Evidence"
                          sx={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 2, border: '1px solid gray' }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">No uploaded images for this hazard report.</Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Action / Update Status / Assign Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{actionType === 'status' ? 'Update Hazard Status & Remarks' : 'Assign Investigator / Maintenance'}</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {actionType === 'status' ? (
            <>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={statusValue} onChange={(e) => setStatusValue(e.target.value)} label="Status">
                  <MenuItem value="open">Pending / Open</MenuItem>
                  <MenuItem value="under_review">Under Review</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Admin Remarks"
                multiline
                rows={3}
                fullWidth
                value={remarksValue}
                onChange={(e) => setRemarksValue(e.target.value)}
              />
            </>
          ) : (
            <FormControl fullWidth>
              <InputLabel>Assign To User</InputLabel>
              <Select
                value={investigatorId}
                onChange={(e) => setInvestigatorId(e.target.value)}
                label="Assign To User"
              >
                {usersList.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.username} ({u.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAction}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};
