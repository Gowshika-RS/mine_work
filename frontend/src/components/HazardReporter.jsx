import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Stack,
  Paper
} from '@mui/material';
import {
  PhotoCamera,
  AutoAwesome,
  Warning,
  Mic,
  Stop,
  Delete,
  VolumeUp
} from '@mui/icons-material';
import apiClient from '../api/client';
import { addToSyncQueue } from '../utils/offlineSync';

export const HazardReporter = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    hazard_type: '',
    severity: 'medium',
    description: '',
    location: '',
  });

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('');

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    // Acquire current GPS location for context
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();
          const place = data.locality || data.city || data.principalSubdivision;
          if (place) {
            setFormData(prev => ({ ...prev, location: `${place} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})` }));
          } else {
            setFormData(prev => ({ ...prev, location: `GPS Zone (${latitude.toFixed(4)}, ${longitude.toFixed(4)})` }));
          }
        } catch {
          setFormData(prev => ({ ...prev, location: `GPS Zone (${latitude.toFixed(4)}, ${longitude.toFixed(4)})` }));
        }
      });
    }
  }, []);

  const hazardTypes = [
    'Gas Leak',
    'Structural Damage',
    'Equipment Malfunction',
    'Electrical Hazard',
    'Fire Risk',
    'Chemical Spill',
    'Ventilation Issue',
    'Noise Hazard',
    'Water Ingress',
    'Unstable Ground',
    'Other',
  ];

  const severityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setAiAnalysis(null);
    }
  };

  // Voice message recording logic
  const startRecording = async () => {
    setError('');
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioPreviewUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Microphone access denied or unavailable. Please enable microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    setAudioPreviewUrl('');
    setRecordingTime(0);
  };

  const handleAIAnalyze = async () => {
    if (!imageFile) {
      setError('Please select an image to analyze.');
      return;
    }
    if (!formData.location.trim()) {
      setError('Please specify the location for context before analyzing.');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const data = new FormData();
      data.append('file', imageFile);
      data.append('location', formData.location);

      const response = await apiClient.post('/ai/hazard-detect', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const aiData = response.data.ai_analysis;
      setAiAnalysis(aiData);

      setFormData(prev => ({
        ...prev,
        hazard_type: hazardTypes.includes(aiData.hazard_type) ? aiData.hazard_type : 'Other',
        severity: aiData.severity || 'medium',
        description: aiData.description || prev.description,
      }));

      setSuccess('AI Analysis complete. Please review the details before submitting.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to analyze image with AI.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.hazard_type.trim()) {
      setError('Please select a hazard type');
      setLoading(false);
      return;
    }
    if (!formData.description.trim() && !audioBlob) {
      setError('Please provide a text description or voice message');
      setLoading(false);
      return;
    }
    if (!formData.location.trim()) {
      setError('Please specify the location');
      setLoading(false);
      return;
    }

    try {
      const reportDesc = formData.description.trim() || "Voice note recorded by worker.";
      const payload = {
        hazard_type: formData.hazard_type,
        severity: formData.severity,
        description: reportDesc,
        location: formData.location,
      };

      // 1. Submit main hazard report
      const res = await apiClient.post('/hazards/report', payload);
      const hazardId = res.data.id;

      // 2. Upload image if attached
      if (imageFile) {
        const imgData = new FormData();
        imgData.append('file', imageFile);
        await apiClient.post(`/hazards/${hazardId}/upload`, imgData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // 3. Upload voice recording if attached
      if (audioBlob) {
        const audioData = new FormData();
        audioData.append('file', audioBlob, 'hazard_voice_note.webm');
        await apiClient.post(`/hazards/${hazardId}/upload-audio`, audioData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccess('🚨 Hazard reported successfully! Alert broadcasted to Supervisors & Admin.');
      if (onSuccess) onSuccess(res.data);

      // Reset form
      setFormData({ hazard_type: '', severity: 'medium', description: '', location: '' });
      setImageFile(null);
      setImagePreview('');
      setAiAnalysis(null);
      clearAudio();
    } catch (err) {
      console.error("Hazard submit error:", err);
      setError(err.response?.data?.detail || 'Failed to report hazard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mt: 2, mb: 4, borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <Warning color="error" /> Report Safety Hazard
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          Reports are dispatched in real-time to both Supervisor Dashboard and Admin Control Room via WebSockets.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Image Upload Area */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                📷 Hazard Photo (Optional)
              </Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 2.5,
                  textAlign: 'center',
                  bgcolor: 'background.default'
                }}
              >
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="icon-button-file"
                  type="file"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                />

                {imagePreview ? (
                  <Box>
                    <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px' }} />
                    <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center', gap: 2 }}>
                      <Button variant="outlined" size="small" onClick={() => fileInputRef.current?.click()}>
                        Change Image
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        color="secondary"
                        onClick={handleAIAnalyze}
                        disabled={analyzing}
                        startIcon={analyzing ? <CircularProgress size={16} /> : <AutoAwesome />}
                      >
                        Analyze with AI
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <label htmlFor="icon-button-file">
                    <Button variant="outlined" component="span" startIcon={<PhotoCamera />} sx={{ p: 1.5 }}>
                      Capture / Upload Photo
                    </Button>
                  </label>
                )}
              </Box>
            </Grid>

            {/* Voice Message Recorder Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VolumeUp color="primary" /> Voice Note Message (Optional)
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fbfbfb' }}>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                  {!isRecording && !audioPreviewUrl && (
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Mic />}
                      onClick={startRecording}
                      sx={{ borderRadius: 3, fontWeight: 'bold' }}
                    >
                      Record Voice Note
                    </Button>
                  )}

                  {isRecording && (
                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={<Stop />}
                      onClick={stopRecording}
                      sx={{ borderRadius: 3, fontWeight: 'bold', animation: 'pulse 1s infinite' }}
                    >
                      Stop Recording ({recordingTime}s)
                    </Button>
                  )}

                  {audioPreviewUrl && (
                    <Box display="flex" alignItems="center" gap={2} width="100%" flexWrap="wrap">
                      <audio controls src={audioPreviewUrl} style={{ height: '38px', flexGrow: 1 }} />
                      <IconButton color="error" onClick={clearAudio} title="Delete Voice Note">
                        <Delete />
                      </IconButton>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>

            {/* AI Analysis Results */}
            {aiAnalysis && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<AutoAwesome />} sx={{ '& .MuiAlert-message': { width: '100%' } }}>
                  <Typography variant="subtitle1" fontWeight="bold">AI Inspection Summary</Typography>
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2"><strong>Risk Level:</strong> <Chip size="small" label={aiAnalysis.risk_level} color="warning" /></Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Required PPE:</strong> {aiAnalysis.required_ppe}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2"><strong>Immediate Actions:</strong> {aiAnalysis.immediate_actions}</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Notify:</strong> {aiAnalysis.notify_who}</Typography>
                    </Grid>
                  </Grid>
                </Alert>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location / Zone"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                helperText="Specify exact shaft or mine section"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Severity Level</InputLabel>
                <Select
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  label="Severity Level"
                >
                  {severityLevels.map((lvl) => (
                    <MenuItem key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Hazard Category</InputLabel>
                <Select
                  name="hazard_type"
                  value={formData.hazard_type}
                  onChange={handleChange}
                  label="Hazard Category"
                >
                  {hazardTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Hazard Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the hazard or leave blank if voice note is recorded"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="error"
                fullWidth
                size="large"
                disabled={loading || isRecording}
                sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1.1rem', borderRadius: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'SUBMIT HAZARD REPORT'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HazardReporter;
