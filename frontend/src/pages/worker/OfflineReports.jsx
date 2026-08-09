import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Card,
  CardContent,
  Grid,
  Alert,
  IconButton,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  WifiOff as OfflineIcon,
  Wifi as OnlineIcon,
  Sync as SyncIcon,
  CloudDone as UploadedIcon,
  Error as FailedIcon,
  CloudUpload as UploadingIcon,
  AddAlert as AddIcon,
  LocationOn as LocationIcon,
  Mic as MicIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import {
  getOfflineReports,
  saveOfflineReport,
  syncOfflineReports,
} from "../../utils/offlineSync";

export default function OfflineReports() {
  const [reports, setReports] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    loadReports();

    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadReports = () => {
    setReports(getOfflineReports());
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage("Synchronizing offline hazard reports with cloud server...");
    const { synced, failed } = await syncOfflineReports();
    setIsSyncing(false);
    loadReports();

    if (synced > 0) {
      setSyncMessage(`Successfully uploaded ${synced} offline report(s)!`);
    } else if (failed > 0) {
      setSyncMessage(`Sync failed for ${failed} report(s). Will retry when connection stabilizes.`);
    } else {
      setSyncMessage("All offline reports are up to date.");
    }
  };

  const createSampleOfflineReport = () => {
    const sample = {
      description: "Gas seepage detected near Shaft 2 drill line",
      category: "Gas Hazard",
      severity: "High",
      location: "Shaft 2 Underground",
      latitude: 23.7957,
      longitude: 86.4304,
      voiceNote: "Recorded audio file attached (0:15)",
      image: null,
    };
    saveOfflineReport(sample);
    loadReports();
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "Uploaded":
        return <Chip icon={<UploadedIcon />} label="Uploaded ✔" color="success" size="small" />;
      case "Uploading":
        return <Chip icon={<UploadingIcon />} label="Uploading..." color="info" size="small" />;
      case "Failed":
        return <Chip icon={<FailedIcon />} label="Failed ❌" color="error" size="small" />;
      default:
        return <Chip icon={<OfflineIcon />} label="Saved Offline 📴" color="warning" size="small" />;
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 900, mx: "auto" }}>
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {isOnline ? (
              <OnlineIcon sx={{ color: "#22c55e", fontSize: 32 }} />
            ) : (
              <OfflineIcon sx={{ color: "#f97316", fontSize: 32 }} />
            )}
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Offline Hazard Sync Manager
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Network Status:{" "}
                <span style={{ color: isOnline ? "#4ade80" : "#fb923c", fontWeight: "bold" }}>
                  {isOnline ? "Online (Connected)" : "Offline (Local Storage Queue)"}
                </span>
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<SyncIcon />}
            disabled={!isOnline || isSyncing}
            onClick={handleSync}
            sx={{ bgcolor: "#0284c7", "&:hover": { bgcolor: "#0369a1" } }}
          >
            {isSyncing ? "Syncing..." : "Sync Now"}
          </Button>
        </Box>

        {isSyncing && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

        {syncMessage && (
          <Alert severity={syncMessage.includes("Uploaded") || syncMessage.includes("up to date") ? "success" : "info"} sx={{ mb: 3, borderRadius: 2 }}>
            {syncMessage}
          </Alert>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Pending Offline Queue ({reports.length})
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={createSampleOfflineReport}
            sx={{ color: "#38bdf8", borderColor: "#38bdf8" }}
          >
            Simulate Offline Report
          </Button>
        </Box>

        {reports.length === 0 ? (
          <Box sx={{ text: "center", py: 5, color: "#94a3b8" }}>
            <Typography variant="body1">No offline reports currently stored.</Typography>
            <Typography variant="caption">
              Reports filed without internet connectivity automatically buffer here and upload when online.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {reports.map((report) => (
              <Grid item xs={12} key={report.id}>
                <Card sx={{ bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 2, color: "#fff" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#f87171" }}>
                          {report.category || "Hazard Report"} - {report.id}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          Created at: {report.timestamp}
                        </Typography>
                      </Box>
                      {getStatusChip(report.syncStatus || report.status)}
                    </Box>

                    <Typography variant="body2" sx={{ mb: 1.5, color: "#cbd5e1" }}>
                      {report.description}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", color: "#94a3b8" }}>
                      <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocationIcon fontSize="small" sx={{ color: "#38bdf8" }} /> {report.location} ({report.latitude}, {report.longitude})
                      </Typography>
                      {report.voiceNote && (
                        <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <MicIcon fontSize="small" sx={{ color: "#a855f7" }} /> {report.voiceNote}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
}
