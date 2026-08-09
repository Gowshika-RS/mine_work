import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Button, Grid,
  Paper, CircularProgress, Chip, Alert, Stack, Divider, LinearProgress, TextField, IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShieldIcon from '@mui/icons-material/Shield';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

import apiClient from '../../api/client';

export const AIHazardReporting = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [location, setLocation] = useState("Acquiring GPS Location...");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();
          const place = data.locality || data.city || data.principalSubdivision;
          if (place) {
            setLocation(`${place} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          } else {
            setLocation(`GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          }
        } catch {
          setLocation(`GPS Zone (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        }
      }, () => setLocation("Current Location"));
    }
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAiResult(null);
      setError(null);
    }
  };

  // Voice message recording logic
  const startRecording = async () => {
    setError(null);
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
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
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

  const handleAnalyzeHazard = async () => {
    if (!selectedImage) {
      setError("Please select or capture a hazard image first.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedImage);
    formData.append("location", location);
    formData.append("language", localStorage.getItem("i18nextLng") || "en");

    if (description.trim()) {
      formData.append("description", description.trim());
    }

    if (audioBlob) {
      formData.append("audio", audioBlob, "hazard_voice_note.webm");
    }

    try {
      const res = await apiClient.post("/ai/hazard-detect", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setAiResult(res.data);
    } catch (err) {
      console.error("AI hazard detection error:", err);
      if (!err.response) {
        setError("Unable to connect to server. Please try again.");
      } else {
        const detail = err.response?.data?.detail;
        const msg = typeof detail === 'string' ? detail : "Unable to analyse the uploaded image. Please try another image.";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'success';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          🔍 AI-Powered Hazard Detection
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Upload an image of your mining environment, add description text or record a voice message. AI Vision model will inspect for Missing PPE, Fire, Water Leakage, Damaged Equipment, or Cracks.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={4}>
        {/* Left Column: Image Upload & Preview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              1. Upload Photo & Attach Notes
            </Typography>

            <Box
              sx={{
                border: '2px dashed #90caf9',
                borderRadius: 3,
                p: 3,
                textAlign: 'center',
                bgcolor: '#f5f9ff',
                cursor: 'pointer',
                mb: 3
              }}
            >
              {previewUrl ? (
                <Box sx={{ position: 'relative' }}>
                  <img
                    src={previewUrl}
                    alt="Hazard Preview"
                    style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '12px' }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    color="secondary"
                    component="label"
                    sx={{ position: 'absolute', bottom: 10, right: 10 }}
                  >
                    Change Image
                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                  </Button>
                </Box>
              ) : (
                <Box component="label" sx={{ display: 'block', cursor: 'pointer', py: 3 }}>
                  <PhotoCameraIcon sx={{ fontSize: 50, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body1" fontWeight="bold">
                    Click to select photo or take picture
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports JPG, PNG, WEBP from camera or gallery
                  </Typography>
                  <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                </Box>
              )}
            </Box>

            {/* Description Text Input */}
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Hazard Description (Optional):
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the hazard or add additional context..."
              sx={{ mb: 2 }}
            />

            {/* Voice Message Recorder */}
            <Typography variant="body2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VolumeUpIcon color="primary" fontSize="small" /> Voice Note Message (Optional):
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fafafa', mb: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                {!isRecording && !audioPreviewUrl && (
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<MicIcon />}
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
                    size="small"
                    startIcon={<StopIcon />}
                    onClick={stopRecording}
                    sx={{ borderRadius: 3, fontWeight: 'bold', animation: 'pulse 1s infinite' }}
                  >
                    Stop Recording ({recordingTime}s)
                  </Button>
                )}

                {audioPreviewUrl && (
                  <Box display="flex" alignItems="center" gap={1} width="100%" flexWrap="wrap">
                    <audio controls src={audioPreviewUrl} style={{ height: '36px', flexGrow: 1 }} />
                    <IconButton color="error" size="small" onClick={clearAudio} title="Delete Voice Note">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Stack>
            </Paper>

            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Location Tag:
            </Typography>
            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3 }}>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '0.95rem'
                }}
              />
            </Box>

            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading || !selectedImage || isRecording}
              onClick={handleAnalyzeHazard}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              {loading ? "Analyzing Image & Dispatching Report..." : "Analyze & Submit Hazard Report"}
            </Button>
          </Paper>
        </Grid>

        {/* Right Column: AI Analysis Output */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, minHeight: '450px' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              2. AI Inspection Results
            </Typography>

            {loading && (
              <Box textAlign="center" py={8}>
                <CircularProgress size={50} />
                <Typography variant="body1" sx={{ mt: 2 }} fontWeight="bold">
                  Evaluating neural vision networks for hazards...
                </Typography>
                <LinearProgress sx={{ mt: 3, mx: 4 }} />
              </Box>
            )}

            {!loading && !aiResult && (
              <Box textAlign="center" py={10} color="text.secondary">
                <ShieldIcon sx={{ fontSize: 70, opacity: 0.3, mb: 2 }} />
                <Typography variant="body1">
                  Upload an image on the left, optionally add description or voice message, and click "Analyze" to see AI Vision detection results.
                </Typography>
              </Box>
            )}

            {aiResult && (
              <Box>
                <Alert severity="success" icon={<CheckCircleOutlineIcon />} sx={{ mb: 3, fontWeight: 'bold' }}>
                  Hazard Report #{aiResult.report_id} automatically generated and synced with Supervisors & Admin!
                </Alert>

                <Card variant="outlined" sx={{ borderRadius: 2, p: 2, mb: 3, bgcolor: '#fafafa' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={7}>
                      <Typography variant="caption" color="text.secondary">Detected Hazard Type</Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {aiResult.hazard_type}
                      </Typography>
                    </Grid>
                    <Grid item xs={5} textAlign="right">
                      <Chip
                        label={`${aiResult.confidence}% CONFIDENCE`}
                        color="primary"
                        sx={{ fontWeight: 'bold', mb: 0.5 }}
                      />
                      <Box>
                        <Chip
                          label={`SEVERITY: ${aiResult.severity.toUpperCase()}`}
                          color={getSeverityColor(aiResult.severity)}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Card>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                      Safety Recommendation & Action:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#fffde7', borderLeft: '4px solid #fbc02d', mt: 0.5 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {aiResult.recommendation}
                      </Typography>
                    </Paper>
                  </Box>

                  {aiResult.ai_analysis && (
                    <>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                          Required PPE:
                        </Typography>
                        <Typography variant="body2">
                          {aiResult.ai_analysis.required_ppe || "Hard Hat, Steel-Toe Boots, Reflective Vest"}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                          Immediate Precautions:
                        </Typography>
                        <Typography variant="body2">
                          {aiResult.ai_analysis.precautions || "Barricade section immediately and maintain distance."}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AIHazardReporting;
