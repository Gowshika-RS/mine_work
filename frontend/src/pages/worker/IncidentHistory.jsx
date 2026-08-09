import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Stack,
  Avatar
} from "@mui/material";
import {
  Assessment as IncidentIcon,
  FilterList as FilterIcon,
  CheckCircle as ResolvedIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectedIcon,
  AccessTime as TimeIcon,
  Warning as HazardIcon,
  Build as EquipmentIcon,
  Security as PPEIcon,
  Emergency as SOSIcon,
  Checklist as ChecklistIcon
} from "@mui/icons-material";
import apiClient from "../../api/client";

export default function IncidentHistory() {
  const [period, setPeriod] = useState("this_month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchIncidentHistory();
  }, [period]);

  const fetchIncidentHistory = async () => {
    setLoading(true);
    setError("");
    try {
      let query = `/incidents/worker-history?period=${period}`;
      if (period === "custom" && startDate && endDate) {
        query += `&start_date=${startDate}&end_date=${endDate}`;
      }
      const res = await apiClient.get(query);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load incident history:", err);
      setError("Failed to fetch incident history records.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCustomFilter = () => {
    if (period === "custom") {
      fetchIncidentHistory();
    }
  };

  const { stats = {}, incidents = [] } = data || {};

  const getTypeIcon = (type) => {
    switch (type) {
      case "Hazard Report":
        return <HazardIcon sx={{ color: "#ff9800" }} />;
      case "Equipment Issue":
        return <EquipmentIcon sx={{ color: "#38bdf8" }} />;
      case "PPE Verification":
        return <PPEIcon sx={{ color: "#4ade80" }} />;
      case "SOS Emergency":
        return <SOSIcon sx={{ color: "#ef4444" }} />;
      default:
        return <ChecklistIcon sx={{ color: "#a855f7" }} />;
    }
  };

  const getStatusChip = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
      case "verified":
      case "completed":
        return <Chip label={`${status} ✔`} color="success" size="small" />;
      case "pending":
      case "submitted":
      case "under review":
      case "under repair":
        return <Chip label={`${status} ⏳`} color="warning" size="small" />;
      case "rejected":
      case "failed":
        return <Chip label={`${status} ❌`} color="error" size="small" />;
      default:
        return <Chip label={status || "Info"} color="default" size="small" />;
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 1000, mx: "auto" }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#fff",
          border: "1px solid #334155"
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IncidentIcon sx={{ fontSize: 36, color: "#38bdf8" }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Incident History & Safety Records
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Comprehensive log of Hazard Reports, Equipment Issues, PPE Verification, SOS Alerts, and Checklists
              </Typography>
            </Box>
          </Box>

          {/* Filter Toolbar */}
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={1}>
            <FormControl size="small" sx={{ minWidth: 140, bgcolor: "#090d16", borderRadius: 2 }}>
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                sx={{ color: "#fff", "& .MuiSvgIcon-root": { color: "#38bdf8" } }}
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="this_week">This Week</MenuItem>
                <MenuItem value="this_month">This Month</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>

            {period === "custom" && (
              <>
                <TextField
                  type="date"
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  sx={{ bgcolor: "#090d16", borderRadius: 2, input: { color: "#fff" } }}
                />
                <TextField
                  type="date"
                  size="small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  sx={{ bgcolor: "#090d16", borderRadius: 2, input: { color: "#fff" } }}
                />
                <Button variant="contained" size="small" onClick={handleApplyCustomFilter} sx={{ bgcolor: "#0284c7" }}>
                  Filter
                </Button>
              </>
            )}
          </Stack>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Statistics Bar Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={2.4}>
            <Card sx={{ bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 3, p: 2, textAlign: "center" }}>
              <Typography variant="caption" color="#94a3b8">TOTAL INCIDENTS</Typography>
              <Typography variant="h4" fontWeight="bold" color="#fff" my={0.5}>
                {stats.total || 0}
              </Typography>
              <Chip label="All Logs" size="small" color="default" sx={{ fontSize: "0.7rem" }} />
            </Card>
          </Grid>

          <Grid item xs={6} sm={2.4}>
            <Card sx={{ bgcolor: "#090d16", border: "1px solid #22c55e", borderRadius: 3, p: 2, textAlign: "center" }}>
              <Typography variant="caption" color="#4ade80">RESOLVED</Typography>
              <Typography variant="h4" fontWeight="bold" color="#22c55e" my={0.5}>
                {stats.resolved || 0}
              </Typography>
              <Chip label="Completed" size="small" color="success" sx={{ fontSize: "0.7rem" }} />
            </Card>
          </Grid>

          <Grid item xs={6} sm={2.4}>
            <Card sx={{ bgcolor: "#090d16", border: "1px solid #eab308", borderRadius: 3, p: 2, textAlign: "center" }}>
              <Typography variant="caption" color="#facc15">PENDING</Typography>
              <Typography variant="h4" fontWeight="bold" color="#eab308" my={0.5}>
                {stats.pending || 0}
              </Typography>
              <Chip label="In Progress" size="small" color="warning" sx={{ fontSize: "0.7rem" }} />
            </Card>
          </Grid>

          <Grid item xs={6} sm={2.4}>
            <Card sx={{ bgcolor: "#090d16", border: "1px solid #ef4444", borderRadius: 3, p: 2, textAlign: "center" }}>
              <Typography variant="caption" color="#f87171">REJECTED</Typography>
              <Typography variant="h4" fontWeight="bold" color="#ef4444" my={0.5}>
                {stats.rejected || 0}
              </Typography>
              <Chip label="Non-Compliant" size="small" color="error" sx={{ fontSize: "0.7rem" }} />
            </Card>
          </Grid>

          <Grid item xs={12} sm={2.4}>
            <Card sx={{ bgcolor: "#090d16", border: "1px solid #38bdf8", borderRadius: 3, p: 2, textAlign: "center" }}>
              <Typography variant="caption" color="#38bdf8">AVG RESOLUTION</Typography>
              <Typography variant="h5" fontWeight="bold" color="#38bdf8" my={0.8}>
                {stats.average_resolution_time || "25 mins"}
              </Typography>
              <Chip label="Fast Response" size="small" color="info" sx={{ fontSize: "0.7rem" }} />
            </Card>
          </Grid>
        </Grid>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: "#1e293b" }}>
                <TableRow>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Type & ID</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Date & Time</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Location</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Description & Photo</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Severity</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {incidents.length > 0 ? (
                  incidents.map((row) => (
                    <TableRow key={row.id} sx={{ "&:hover": { bgcolor: "#1e293b" } }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ bgcolor: "transparent", width: 36, height: 36, border: "1px solid #334155" }}>
                            {getTypeIcon(row.type)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold" color="#fff">
                              {row.title}
                            </Typography>
                            <Typography variant="caption" color="#94a3b8">
                              {row.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="#fff">
                          {row.date}
                        </Typography>
                        <Typography variant="caption" color="#94a3b8">
                          {row.time}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                        {row.location}
                      </TableCell>

                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography variant="body2" color="#e2e8f0" noWrap title={row.description}>
                          {row.description}
                        </Typography>
                        {row.image_url && (
                          <Chip
                            label="Photo Attached 📷"
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5, fontSize: "0.65rem", color: "#38bdf8", borderColor: "#38bdf8" }}
                          />
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={row.severity}
                          size="small"
                          color={row.severity?.toLowerCase() === "critical" ? "error" : (row.severity?.toLowerCase() === "high" ? "warning" : "default")}
                          sx={{ fontWeight: "bold" }}
                        />
                      </TableCell>

                      <TableCell>
                        {getStatusChip(row.status)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: "#94a3b8", py: 4 }}>
                      No incident history records found for the selected period filter.
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
