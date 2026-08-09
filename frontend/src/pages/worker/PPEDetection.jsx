import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  Stack
} from "@mui/material";
import {
  CameraAlt as CameraIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  VerifiedUser as VerifiedIcon,
  History as HistoryIcon,
  PhotoCamera as SnapIcon,
  Security as SecurityIcon,
  Refresh as RetryIcon,
  Login as CheckInIcon
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import apiClient from "../../api/client";

export default function PPEDetection({ onVerificationSuccess, onProceedToCheckIn }) {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [history, setHistory] = useState([]);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    fetchPPEHistory();
    return () => stopCamera();
  }, []);

  const fetchPPEHistory = async () => {
    try {
      const res = await apiClient.get("/ppe/history");
      setHistory(res.data || []);
    } catch (e) {
      console.log("Error fetching PPE history:", e);
    }
  };

  const startCamera = async () => {
    try {
      setErrorMsg("");
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      console.warn("Camera hardware access error:", err);
      setErrorMsg("Camera access denied or unavailable. You can upload a photo to verify PPE.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setCapturedPhoto(dataUrl);
      stopCamera();
      runPPEDetection(dataUrl, false);
    }
  };

  const runPPEDetection = async (photoBase64, simulateFail = false) => {
    setIsScanning(true);
    setScanComplete(false);
    setErrorMsg("");

    try {
      const res = await apiClient.post("/ppe/verify", {
        image_base64: photoBase64,
        simulate_fail: simulateFail
      });

      setScanResult(res.data);
      setScanComplete(true);
      fetchPPEHistory();

      if (res.data.passed) {
        if (onVerificationSuccess) onVerificationSuccess(res.data);
      }
    } catch (err) {
      console.error("PPE verification error:", err);
      setErrorMsg(err.response?.data?.detail || "PPE Detection failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSimulatePass = () => {
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = 300;
    sampleCanvas.height = 300;
    const ctx = sampleCanvas.getContext("2d");
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, 300, 300);
    const dataUrl = sampleCanvas.toDataURL("image/jpeg");
    setCapturedPhoto(dataUrl);
    runPPEDetection(dataUrl, false);
  };

  const handleSimulateFail = () => {
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = 300;
    sampleCanvas.height = 300;
    const ctx = sampleCanvas.getContext("2d");
    ctx.fillStyle = "#334155";
    ctx.fillRect(0, 0, 300, 300);
    const dataUrl = sampleCanvas.toDataURL("image/jpeg");
    setCapturedPhoto(dataUrl);
    runPPEDetection(dataUrl, true);
  };

  return (
    <Box sx={{ p: 2, maxWidth: 950, mx: "auto" }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "#fff",
          border: "1px solid #334155"
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1.5, flexWrap: "wrap", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <SecurityIcon sx={{ fontSize: 36, color: "#38bdf8" }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {t('ppe.title')}
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                {t('ppe.subtitle')}
              </Typography>
            </Box>
          </Box>

          <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} sx={{ "& .MuiTab-root": { color: "#94a3b8" }, "& .Mui-selected": { color: "#38bdf8" } }}>
            <Tab icon={<VerifiedIcon />} label="PPE Verification" />
            <Tab icon={<HistoryIcon />} label="Scan Records History" />
          </Tabs>
        </Box>

        <Divider sx={{ borderColor: "#334155", mb: 3 }} />

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {tabIndex === 0 && (
          <Grid container spacing={3}>
            {/* Camera Preview Section */}
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 3, overflow: "hidden" }}>
                <Box sx={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", bgcolor: "#000" }}>
                  <canvas ref={canvasRef} style={{ display: "none" }} />

                  {cameraActive ? (
                    <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : capturedPhoto ? (
                    <img src={capturedPhoto} alt="Selfie preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Box textAlign="center" color="#64748b" p={2}>
                      <CameraIcon sx={{ fontSize: 60, mb: 1, color: "#475569" }} />
                      <Typography variant="body2">Open camera to capture live selfie for PPE analysis</Typography>
                    </Box>
                  )}

                  {isScanning && (
                    <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                      <LinearProgress sx={{ width: "80%", mb: 2, height: 8, borderRadius: 4 }} />
                      <Typography variant="body1" fontWeight="bold">
                        Running AI Computer Vision Detection...
                      </Typography>
                      <Typography variant="caption" color="#94a3b8">
                        Scanning helmet, reflective vest, face mask, safety goggles
                      </Typography>
                    </Box>
                  )}
                </Box>

                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" gap={1}>
                    {!cameraActive ? (
                      <Button variant="contained" startIcon={<CameraIcon />} onClick={startCamera} sx={{ bgcolor: "#0284c7" }}>
                        Open Camera
                      </Button>
                    ) : (
                      <Button variant="contained" color="success" startIcon={<SnapIcon />} onClick={capturePhoto}>
                        Capture Selfie
                      </Button>
                    )}

                    <Button variant="outlined" size="small" onClick={handleSimulatePass} sx={{ color: "#4ade80", borderColor: "#4ade80" }}>
                      Simulate 100% PPE Pass
                    </Button>
                    <Button variant="outlined" size="small" onClick={handleSimulateFail} sx={{ color: "#f87171", borderColor: "#f87171" }}>
                      Simulate Missing Items
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Verification Results Panel */}
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 3, p: 2.5, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#38bdf8", mb: 2 }}>
                    🔍 AI Equipment Detection Breakdown
                  </Typography>

                  {scanComplete && scanResult ? (
                    <Box>
                      <Alert severity={scanResult.passed ? "success" : "error"} sx={{ mb: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {scanResult.passed ? "✅ PPE Verification Successful" : "❌ PPE Verification Failed"}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Confidence Score: {scanResult.confidence_score || scanResult.confidence}%
                        </Typography>
                      </Alert>

                      {/* Required Items Grid */}
                      <Grid container spacing={1.5} sx={{ mb: 2 }}>
                        {[
                          { key: "helmet", label: "Safety Helmet", icon: "🪖" },
                          { key: "vest", label: "Reflective Safety Vest", icon: "🤿" },
                          { key: "mask", label: "Face Mask", icon: "😷" },
                          { key: "goggles", label: "Safety Goggles", icon: "🥽" }
                        ].map((item) => {
                          const isDetected = scanResult.items ? scanResult.items[item.key] : !scanResult.missing_equipment.includes(item.label);
                          return (
                            <Grid item xs={6} key={item.key}>
                              <Paper sx={{ p: 1.5, bgcolor: isDetected ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)", border: `1px solid ${isDetected ? "#22c55e" : "#ef4444"}`, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <span>{item.icon}</span>
                                  <Typography variant="body2" fontWeight="500" color="#fff">
                                    {item.label}
                                  </Typography>
                                </Box>
                                {isDetected ? <CheckIcon sx={{ color: "#22c55e" }} /> : <CancelIcon sx={{ color: "#ef4444" }} />}
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>

                      {!scanResult.passed && (
                        <Alert severity="warning" sx={{ mb: 2, bgcolor: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
                          Missing Gear: <strong>{scanResult.missing_equipment.join(", ") || "Safety Items"}</strong>. Check-In disabled until resolved.
                        </Alert>
                      )}
                    </Box>
                  ) : (
                    <Box textAlign="center" py={4} color="#64748b">
                      <Typography variant="body2">Take a photo to view PPE detection items.</Typography>
                    </Box>
                  )}
                </Box>

                {/* Bottom Action Footer */}
                <Box pt={2}>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    size="large"
                    disabled={!scanComplete || !scanResult?.passed}
                    startIcon={<CheckInIcon />}
                    onClick={() => {
                      if (onProceedToCheckIn) onProceedToCheckIn();
                    }}
                    sx={{ py: 1.5, borderRadius: 3, fontWeight: "bold", fontSize: "1rem" }}
                  >
                    {scanResult?.passed ? "Proceed to Attendance Check-In ✔" : "Check-In Locked (PPE Required)"}
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* History Tab */}
        {tabIndex === 1 && (
          <TableContainer component={Paper} sx={{ bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: "#1e293b" }}>
                <TableRow>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Scan ID</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Timestamp</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Confidence</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Missing Gear</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.length > 0 ? (
                  history.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>PPE-{row.id}</TableCell>
                      <TableCell sx={{ color: "#94a3b8" }}>{new Date(row.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          icon={row.passed ? <CheckIcon /> : <CancelIcon />}
                          label={row.passed ? "Passed ✔" : "Failed ❌"}
                          color={row.passed ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#fff" }}>{row.confidence_score || row.confidence}%</TableCell>
                      <TableCell sx={{ color: "#f87171" }}>
                        {row.missing_equipment && row.missing_equipment.length > 0 ? row.missing_equipment.join(", ") : "None"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: "#94a3b8", py: 3 }}>
                      No PPE scan history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
