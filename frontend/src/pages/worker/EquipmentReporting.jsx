import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Build as EquipmentIcon,
  ReportProblem as ReportIcon,
  PhotoCamera as PhotoIcon,
  Mic as MicIcon,
  History as HistoryIcon,
  Send as SendIcon,
} from "@mui/icons-material";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/equipment/reports");
      const data = await res.json();
      if (data.success) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error("Failed to fetch equipment reports:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        equipment_id: equipmentId || `EQP-${Math.floor(1000 + Math.random() * 9000)}`,
        equipment_name: category,
        category: category,
        location: location,
        urgency: urgency,
        description: description,
        reported_by: "Current Worker",
      };

      const res = await fetch("http://localhost:8000/api/equipment/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Equipment issue reported! Maintenance team notified.");
        setDescription("");
        setEquipmentId("");
        fetchReports();
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyChip = (val) => {
    switch (val) {
      case "Critical":
        return <Chip label="Critical" color="error" size="small" fontWeight="bold" />;
      case "High":
        return <Chip label="High" color="warning" size="small" />;
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
        return <Chip label="Submitted ⏳" color="default" size="small" />;
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

              {/* Attachments */}
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PhotoIcon />}
                  sx={{ color: "#38bdf8", borderColor: "#334155", py: 1.2 }}
                >
                  Upload Equipment Photo
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<MicIcon />}
                  onClick={() => setVoiceNote("Voice memo recorded (0:12)")}
                  sx={{ color: "#a855f7", borderColor: "#334155", py: 1.2 }}
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
                  Submit Equipment Report
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
                {reports.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ color: "#38bdf8", fontWeight: "bold" }}>{row.equipment_id}</TableCell>
                    <TableCell sx={{ color: "#fff" }}>
                      <Typography variant="body2" fontWeight="bold">{row.equipment_name}</Typography>
                      <Typography variant="caption" color="#94a3b8">{row.location}</Typography>
                    </TableCell>
                    <TableCell>{getUrgencyChip(row.urgency)}</TableCell>
                    <TableCell sx={{ color: "#cbd5e1", maxWidth: 220 }}>{row.description}</TableCell>
                    <TableCell>{getStatusChip(row.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
