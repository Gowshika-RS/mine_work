import apiClient from "../api/client";

const STORAGE_KEY = "mine_work_offline_hazards";

export const getOfflineReports = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading offline reports:", err);
    return [];
  }
};

export const saveOfflineReport = (reportData) => {
  const reports = getOfflineReports();
  const newReport = {
    id: `OFFLINE-${Date.now()}`,
    ...reportData,
    status: "Saved Offline",
    timestamp: new Date().toISOString(),
    syncStatus: "Pending" // Pending, Uploading, Uploaded, Failed
  };
  reports.unshift(newReport);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  return newReport;
};

// Export alias for components importing addToSyncQueue
export const addToSyncQueue = saveOfflineReport;

export const removeOfflineReport = (id) => {
  const reports = getOfflineReports().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

export const updateOfflineReportStatus = (id, syncStatus) => {
  const reports = getOfflineReports().map((r) => {
    if (r.id === id) {
      return { ...r, syncStatus, status: syncStatus === "Uploaded" ? "Uploaded" : r.status };
    }
    return r;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

export const syncOfflineReports = async () => {
  const reports = getOfflineReports();
  const pending = reports.filter((r) => r.syncStatus === "Pending" || r.syncStatus === "Failed");

  if (pending.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const report of pending) {
    try {
      updateOfflineReportStatus(report.id, "Uploading");

      // Post using configured apiClient
      const response = await apiClient.post("/ai-hazards/report", {
        description: report.description,
        hazard_type: report.category || "General Hazard",
        severity: report.severity || "Medium",
        location: report.location || "Underground Pit",
        latitude: report.latitude || 23.7957,
        longitude: report.longitude || 86.4304,
        reporter_name: report.reporter_name || "Worker",
        voice_note: report.voiceNote || null,
        image_url: report.image || null
      });

      if (response.status === 200 || response.status === 201) {
        updateOfflineReportStatus(report.id, "Uploaded");
        synced++;
      } else {
        updateOfflineReportStatus(report.id, "Failed");
        failed++;
      }
    } catch (err) {
      console.error("Failed syncing offline report:", err);
      updateOfflineReportStatus(report.id, "Failed");
      failed++;
    }
  }

  return { synced, failed };
};
