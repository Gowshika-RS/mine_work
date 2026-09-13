import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Stack
} from "@mui/material";
import {
  Build as EquipmentIcon,
  ReportProblem as ReportIcon,
  PhotoCamera as PhotoIcon,
  Mic as MicIcon,
  History as HistoryIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon
} from "@mui/icons-material";
import apiClient from "../../api/client";

const EQUIPMENT_TYPES = [
  "Broken Helmet / PPE",
  "Damaged Rock Drill",
  "Faulty Haulage Machine",
  "Gas Sensor Failure",
  "Broken Hoist Rope",
  "Electrical / Wiring Problem",
  "Ventilation Fan Malfunction",
  "Other Heavy Machinery",
];

export default function EquipmentReporting() {
  const [tabIndex, setTabIndex] = useState(0);
  const [equipmentId, setEquipmentId] = useState("");
  const [category, setCategory] = useState(EQUIPMENT_TYPES[0]);
  const [location, setLocation] = useState("Pit Alpha - Underground Level 2");
  const [urgency, setUrgency] = useState("High");
  const [description, setDescription] = useState("");
  const [voiceNote, setVoiceNote] = useState("");
  const [photoBase64, setPhotoBase64] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [reports, setReports] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await apiClient.get("/equipment/my-reports");
      if (res.data && res.data.reports) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error("Failed to fetch equipment reports:", err);
      // Fallback try all reports
      try {
        const fallbackRes = await apiClient.get("/equipment/reports");
        if (fallbackRes.data && fallbackRes.data.reports) {
          setReports(fallbackRes.data.reports);
        }
      } catch (e2) {
        console.error("Fallback reports fetch failed:", e2);
      }
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const payload = {
        equipment_type: category,
        equipment_id: equipmentId || `EQP-${Math.floor(1000 + Math.random() * 9000)}`,
        location: location,
        priority: urgency,
        description: description,
        photo_base64: photoBase64,
        voice_base64: voiceNote ? "Recorded Voice Description" : null
      };

      const res = await apiClient.post("/equipment/report", payload);
      if (res.data && res.data.success) {
        setSuccessMsg("Equipment issue reported! Maintenance team and supervisors notified.");
        setDescription("");
        setEquipmentId("");
        setPhotoBase64(null);
        setVoiceNote("");
        fetchReports();
        setTabIndex(1);
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to submit equipment issue report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyChip = (val) => {
    switch (val) {
      case "Critical":
        return <Chip label="Critical" color="error" size="small" sx={{ fontWeight: "bold" }} />;
      case "High":
        return <Chip label="High" color="warning" size="small" sx={{ fontWeight: "bold" }} />;
      case "Medium":
        return <Chip label="Medium" color="info" size="small" />;
      default:
        return <Chip label="Low" color="default" size="small" />;
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "Resolved":
        return <Chip label="Resolved ✔" color="success" size="small" />;
      case "Under Repair":
      case "In Progress":
        return <Chip label="In Progress 🛠️" color="warning" size="small" />;
      case "Under Review":
        return <Chip label="Under Review 🔍" color="info" size="small" />;
      case "Rejected":
        return <Chip label="Rejected ❌" color="error" size="small" />;
      default:
        return <Chip label="Submitted ⏳" color="primary" size="small" />;
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 950, mx: "auto" }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#fff",
          border: "1px solid #334155",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <EquipmentIcon sx={{ fontSize: 34, color: "#f59e0b" }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Equipment Issue Reporting Module
            </Typography>
            <Typography variant="body2" color="#94a3b8">
              Report broken gear, machine failures, or safety equipment defects to supervisors
            </Typography>
          </Box>
        </Box>

        <Tabs
          value={tabIndex}
          onChange={(e, val) => setTabIndex(val)}
          sx={{
            mb: 3,
            "& .MuiTab-root": { color: "#94a3b8", fontWeight: "bold" },
            "& .Mui-selected": { color: "#f59e0b" },
          }}
        >
          <Tab icon={<ReportIcon />} label="File Equipment Issue" iconPosition="start" />
          <Tab icon={<HistoryIcon />} label={`Issue History (${reports.length})`} iconPosition="start" />
        </Tabs>

        {successMsg && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {successMsg}
          </Alert>
        )}

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {tabIndex === 0 && (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Equipment / Machine Code (Optional)"
                  value={equipmentId}
                  onChange={(e) => setEquipmentId(e.target.value)}
                  placeholder="e.g. DRILL-402, DRILL-ROPE-9"
                  InputLabelProps={{ style: { color: "#94a3b8" } }}
                  InputProps={{ style: { color: "#fff", backgroundColor: "#090d16" } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel style={{ color: "#94a3b8" }}>Fault / Equipment Category</InputLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ color: "#fff", backgroundColor: "#090d16" }}
                  >
                    {EQUIPMENT_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location in Mine"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  InputLabelProps={{ style: { color: "#94a3b8" } }}
                  InputProps={{ style: { color: "#fff", backgroundColor: "#090d16" } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel style={{ color: "#94a3b8" }}>Urgency Level</InputLabel>
                  <Select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    style={{ color: "#fff", backgroundColor: "#090d16" }}
                  >
                    <MenuItem value="Low">Low (Routine Maintenance)</MenuItem>
                    <MenuItem value="Medium">Medium (Affects Efficiency)</MenuItem>
                    <MenuItem value="High">High (Immediate Repair Required)</MenuItem>
                    <MenuItem value="Critical">Critical (Halts Operation / Safety Risk)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Detailed Issue Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the failure, sounds, leaks, or damage observed..."
                  required
                  InputLabelProps={{ style: { color: "#94a3b8" } }}
                  InputProps={{ style: { color: "#fff", backgroundColor: "#090d16" } }}
                />
              </Grid>

              {/* Photo Upload Input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />

              {/* Attachments */}
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={photoBase64 ? <CheckIcon color="success" /> : <PhotoIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ color: photoBase64 ? "#4ade80" : "#38bdf8", borderColor: "#334155", py: 1.2 }}
                >
                  {photoBase64 ? "Photo Attached ✔" : "Upload Equipment Photo"}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<MicIcon />}
                  onClick={() => setVoiceNote("Voice memo recorded (0:12)")}
                  sx={{ color: voiceNote ? "#a855f7" : "#cbd5e1", borderColor: "#334155", py: 1.2 }}
                >
                  {voiceNote || "Record Voice Description"}
                </Button>
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  startIcon={<SendIcon />}
                  sx={{ bgcolor: "#f59e0b", color: "#000", fontWeight: "bold", "&:hover": { bgcolor: "#d97706" } }}
                >
                  {isSubmitting ? "Submitting..." : "Submit Equipment Report"}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}

        {tabIndex === 1 && (
          <TableContainer component={Paper} sx={{ bgcolor: "#0f172a", borderRadius: 2, border: "1px solid #334155" }}>
            <Table>
              <TableHead sx={{ bgcolor: "#1e293b" }}>
                <TableRow>
                  <TableCell sx={{ color: "#94a3b8" }}>Equipment Code</TableCell>
                  <TableCell sx={{ color: "#94a3b8" }}>Category & Location</TableCell>
                  <TableCell sx={{ color: "#94a3b8" }}>Urgency</TableCell>
                  <TableCell sx={{ color: "#94a3b8" }}>Description</TableCell>
                  <TableCell sx={{ color: "#94a3b8" }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: "#94a3b8", py: 4 }}>
                      No equipment issues reported yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ color: "#38bdf8", fontWeight: "bold" }}>{row.equipment_id}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        <Typography variant="body2" fontWeight="bold">{row.equipment_name || row.category}</Typography>
                        <Typography variant="caption" color="#94a3b8">{row.location}</Typography>
                      </TableCell>
                      <TableCell>{getUrgencyChip(row.urgency || row.priority)}</TableCell>
                      <TableCell sx={{ color: "#cbd5e1", maxWidth: 220 }}>{row.description}</TableCell>
                      <TableCell>{getStatusChip(row.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
