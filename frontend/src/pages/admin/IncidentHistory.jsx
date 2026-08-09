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
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Divider,
} from "@mui/material";
import {
  Assignment as LogIcon,
  FilterList as FilterIcon,
  Download as ExportIcon,
  CheckCircle as ResolvedIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectedIcon,
  Assessment as ChartIcon,
} from "@mui/icons-material";

export default function IncidentHistory() {
  const [filterPeriod, setFilterPeriod] = useState("This Month");
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, open: 0, days_without_accident: 18 });

  useEffect(() => {
    fetchIncidents();
  }, [filterSeverity, filterCategory]);

  const fetchIncidents = async () => {
    try {
      const url = `http://localhost:8000/api/incidents/history?severity=${filterSeverity}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setIncidents(data.incidents);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch incident history:", err);
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Title", "Category", "Severity", "Zone", "Reported By", "Timestamp", "Status", "Resolution Time"];
    const csvRows = [headers.join(",")];

    incidents.forEach((inc) => {
      const row = [
        inc.id,
        `"${inc.title}"`,
        inc.category,
        inc.severity,
        `"${inc.zone}"`,
        `"${inc.reported_by}"`,
        inc.timestamp,
        inc.status,
        inc.resolution_time,
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `Incident_History_Report_${Date.now()}.csv`);
    a.click();
  };

  const getSeverityChip = (sev) => {
    switch (sev) {
      case "Critical":
        return <Chip label="Critical" color="error" size="small" fontWeight="bold" />;
      case "High":
      case "Moderate":
        return <Chip label={sev} color="warning" size="small" />;
      default:
        return <Chip label={sev} color="info" size="small" />;
    }
  };

  const getStatusChip = (st) => {
    switch (st) {
      case "Resolved":
      case "Closed":
        return <Chip icon={<ResolvedIcon />} label="Resolved ✔" color="success" size="small" />;
      case "Investigating":
      case "Pending":
        return <Chip icon={<PendingIcon />} label="Investigating ⏳" color="warning" size="small" />;
      default:
        return <Chip icon={<RejectedIcon />} label={st} color="error" size="small" />;
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 1100, mx: "auto" }}>
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
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <LogIcon sx={{ fontSize: 36, color: "#38bdf8" }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Incident History & Safety Analytics Dashboard
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Aggregated logs of Hazards, Equipment Failures, PPE Verification, SOS Alerts & Safety Violations
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="success"
            startIcon={<ExportIcon />}
            onClick={handleExportCSV}
            sx={{ fontWeight: "bold" }}
          >
            Export CSV Report
          </Button>
        </Box>

        {/* 4 Summary Stat Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 2, color: "#fff" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="#94a3b8">TOTAL INCIDENTS</Typography>
                <Typography variant="h4" fontWeight="bold" color="#38bdf8">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 2, color: "#fff" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="#94a3b8">RESOLVED</Typography>
                <Typography variant="h4" fontWeight="bold" color="#4ade80">
                  {incidents.filter((i) => i.status === "Resolved" || i.status === "Closed").length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 2, color: "#fff" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="#94a3b8">OPEN INVESTIGATIONS</Typography>
                <Typography variant="h4" fontWeight="bold" color="#fb923c">{stats.open}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 2, color: "#fff" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="#94a3b8">DAYS WITHOUT ACCIDENT</Typography>
                <Typography variant="h4" fontWeight="bold" color="#a855f7">{stats.days_without_accident}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter Controls */}
        <Paper sx={{ p: 2, bgcolor: "#1e293b", border: "1px solid #334155", borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: "#cbd5e1", fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
            <FilterIcon fontSize="small" /> Filter Incident Records
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel style={{ color: "#94a3b8" }}>Date Period</InputLabel>
                <Select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  style={{ color: "#fff", backgroundColor: "#090d16" }}
                >
                  <MenuItem value="Today">Today</MenuItem>
                  <MenuItem value="This Week">This Week</MenuItem>
                  <MenuItem value="This Month">This Month</MenuItem>
                  <MenuItem value="Custom Date Range">Custom Date Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel style={{ color: "#94a3b8" }}>Severity</InputLabel>
                <Select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  style={{ color: "#fff", backgroundColor: "#090d16" }}
                >
                  <MenuItem value="All">All Severities</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                  <MenuItem value="Moderate">Moderate / High</MenuItem>
                  <MenuItem value="Minor">Minor</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel style={{ color: "#94a3b8" }}>Incident Category</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{ color: "#fff", backgroundColor: "#090d16" }}
                >
                  <MenuItem value="All">All Categories</MenuItem>
                  <MenuItem value="Gas Hazard">Gas Hazard</MenuItem>
                  <MenuItem value="Structural Integrity">Structural Integrity</MenuItem>
                  <MenuItem value="Equipment Failure">Equipment Failure</MenuItem>
                  <MenuItem value="PPE Violation">PPE Violation</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Incidents Data Table */}
        <TableContainer component={Paper} sx={{ bgcolor: "#0f172a", borderRadius: 2, border: "1px solid #334155" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#1e293b" }}>
              <TableRow>
                <TableCell sx={{ color: "#94a3b8" }}>Incident ID</TableCell>
                <TableCell sx={{ color: "#94a3b8" }}>Title & Description</TableCell>
                <TableCell sx={{ color: "#94a3b8" }}>Zone / Location</TableCell>
                <TableCell sx={{ color: "#94a3b8" }}>Severity</TableCell>
                <TableCell sx={{ color: "#94a3b8" }}>Status</TableCell>
                <TableCell sx={{ color: "#94a3b8" }}>Resolution Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidents.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: "#38bdf8", fontWeight: "bold" }}>{row.id}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    <Typography variant="subtitle2" fontWeight="bold">{row.title}</Typography>
                    <Typography variant="caption" color="#cbd5e1" display="block">{row.description}</Typography>
                    {row.corrective_action && (
                      <Typography variant="caption" color="#4ade80" display="block">
                        <strong>Action:</strong> {row.corrective_action}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ color: "#cbd5e1" }}>{row.zone}</TableCell>
                  <TableCell>{getSeverityChip(row.severity)}</TableCell>
                  <TableCell>{getStatusChip(row.status)}</TableCell>
                  <TableCell sx={{ color: "#cbd5e1" }}>{row.resolution_time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
