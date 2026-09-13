import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "./theme/theme";
import { useTheme } from "./hooks/useTheme";
import { MainLayout } from "./components/layout";
import { GeolocationProvider } from "./context/GeolocationContext";
import { SocketProvider } from "./context/SocketContext";

// Auth Pages
import { HomePage, Login, Register, ForgotPassword } from "./pages/auth";

// Worker Pages
import {
  WorkerDashboard,
  Profile,
  Shift,
  Map,
  Hazards as WorkerHazards,
  Checklist,
  Recommendations,
  Notifications,
  RiskAnalysis,
  AIPrediction,
  SOSPage,
  AIHazardReporting,
  RealTimeChat,
  LiveWeather,
  GamificationStreaks,
  CameraAttendance,
  PPEDetection,
  PersonalSafetyScore,
  EquipmentReporting,
  OfflineReports,
  ShiftMonitoring,
  IncidentHistory,
  WorkerLeave,
} from "./pages/worker";


// Admin Pages
import {
  AdminDashboard,
  Workers,
  WorkerDetails,
  LiveMap,
  Hazards as AdminHazards,
  SOSCenter,
  Reports,
  Notifications as AdminNotifications,
  UserManagement,
  Settings,
  Supervisors,
  EquipmentIssues,
  PPEMonitoring,
  SafetyChecklists,
  AttendanceShifts,
  SafetyScores,
  MineZonesGeofencing,
  EnvironmentMonitoring,
  CommunicationCenter,
  Analytics as AdminAnalytics,
  IncidentHistory as AdminIncidentHistory,
  AdminLeave,
} from "./pages/admin";

// Supervisor Pages
import {
  SupervisorDashboard,
  SupervisorWorkers,
  SupervisorLiveTracking,
  SupervisorTaskManagement,
  SupervisorHazards,
  SupervisorEmergencyCenter,
  SupervisorAttendance,
  SupervisorCommunication,
  SupervisorSafetyAnalytics,
  SupervisorReports,
  SupervisorNotifications,
  SupervisorProfile,
  SupervisorEquipment,
  SupervisorPPEMonitoring,
  SupervisorChecklists,
  SupervisorSafetyScores,
  SupervisorZones,
  SupervisorGeofenceAlerts,
  SupervisorEnvironment,
  SupervisorIncidents,
  SupervisorShiftHandover,
  SupervisorLeave,
  SupervisorMineMonitoring,
  SupervisorAnnouncements,
  SupervisorShifts,
  SupervisorHealthMonitoring,
} from "./pages/supervisor";

// Emergency Officer Pages
import {
  EmergencyDashboard,
  EmergencySOSCenter,
  EmergencyLiveMap,
  EmergencyHazards,
  EmergencyDispatch,
  EmergencyBroadcast,
  EmergencyEnvironment,
  EmergencyIncidentLogs,
  EmergencyProfile,
  EmergencyLeave,
} from "./pages/emergency";

function App() {
  const { isDarkMode, toggleTheme } = useTheme();

  const [userRole, setUserRole] = useState(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        return user.role || "worker";
      } catch {
        return "worker";
      }
    }
    return "worker";
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    return Boolean(token && userJson);
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        setIsAuthenticated(true);
        setUserRole(user.role || "worker");
      } catch (err) {
        console.error("Failed to restore session:", err);
      }
    }
  }, []);

  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUserRole("worker");
  };

  const ProtectedLayout = ({ children, role }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (role && userRole !== role) {
      const redirectPath =
        userRole === 'admin'
          ? '/admin/dashboard'
          : userRole === 'supervisor'
          ? '/supervisor/dashboard'
          : userRole === 'emergency_officer'
          ? '/emergency/dashboard'
          : '/worker/dashboard';
      return <Navigate to={redirectPath} replace />;
    }

    return (
      <MainLayout
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
        userRole={role}
        onLogout={handleLogout}
      >
        {children}
      </MainLayout>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {!isOnline && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ff9800',
          color: '#fff',
          textAlign: 'center',
          padding: '8px',
          zIndex: 9999,
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          You are currently offline. Actions will be saved and synced when you reconnect.
        </div>
      )}

      <SocketProvider>
        <GeolocationProvider userRole={userRole} isAuthenticated={isAuthenticated}>
          <Router>
            <Routes>
              {/* Authentication Routes */}
              <Route path="/" element={<HomePage />} />
              <Route
                path="/login"
                element={
                  <Login
                    setIsAuthenticated={setIsAuthenticated}
                    setUserRole={setUserRole}
                  />
                }
              />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Worker Routes */}
              <Route path="/worker/dashboard" element={<ProtectedLayout role="worker"><WorkerDashboard /></ProtectedLayout>} />
              <Route path="/worker/profile" element={<ProtectedLayout role="worker"><Profile /></ProtectedLayout>} />
              <Route path="/worker/shift" element={<ProtectedLayout role="worker"><Shift /></ProtectedLayout>} />
              <Route path="/worker/map" element={<ProtectedLayout role="worker"><Map /></ProtectedLayout>} />
              <Route path="/worker/hazards" element={<ProtectedLayout role="worker"><WorkerHazards /></ProtectedLayout>} />
              <Route path="/worker/checklist" element={<ProtectedLayout role="worker"><Checklist /></ProtectedLayout>} />
              <Route path="/worker/recommendations" element={<ProtectedLayout role="worker"><Recommendations /></ProtectedLayout>} />
              <Route path="/worker/notifications" element={<ProtectedLayout role="worker"><Notifications /></ProtectedLayout>} />
              <Route path="/worker/risk-analysis" element={<ProtectedLayout role="worker"><RiskAnalysis /></ProtectedLayout>} />
              <Route path="/worker/ai-prediction" element={<ProtectedLayout role="worker"><AIPrediction /></ProtectedLayout>} />

              <Route path="/worker/sos" element={<ProtectedLayout role="worker"><SOSPage /></ProtectedLayout>} />
              <Route path="/worker/ai-hazards" element={<ProtectedLayout role="worker"><AIHazardReporting /></ProtectedLayout>} />
              <Route path="/worker/chat" element={<ProtectedLayout role="worker"><RealTimeChat /></ProtectedLayout>} />
              <Route path="/worker/weather" element={<ProtectedLayout role="worker"><LiveWeather /></ProtectedLayout>} />
              <Route path="/worker/attendance" element={<ProtectedLayout role="worker"><CameraAttendance /></ProtectedLayout>} />
              <Route path="/worker/streaks" element={<ProtectedLayout role="worker"><GamificationStreaks /></ProtectedLayout>} />

              {/* 7 Enhanced Worker Features */}
              <Route path="/worker/ppe" element={<ProtectedLayout role="worker"><PPEDetection /></ProtectedLayout>} />
              <Route path="/worker/safety-score" element={<ProtectedLayout role="worker"><PersonalSafetyScore /></ProtectedLayout>} />
              <Route path="/worker/offline-reports" element={<ProtectedLayout role="worker"><OfflineReports /></ProtectedLayout>} />
              <Route path="/worker/equipment-reporting" element={<ProtectedLayout role="worker"><EquipmentReporting /></ProtectedLayout>} />
              <Route path="/worker/shift-monitoring" element={<ProtectedLayout role="worker"><ShiftMonitoring /></ProtectedLayout>} />
              <Route path="/worker/incident-history" element={<ProtectedLayout role="worker"><IncidentHistory /></ProtectedLayout>} />
              <Route path="/worker/leave" element={<ProtectedLayout role="worker"><WorkerLeave /></ProtectedLayout>} />


            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedLayout role="admin"><AdminDashboard /></ProtectedLayout>} />
            <Route path="/admin/workers" element={<ProtectedLayout role="admin"><Workers /></ProtectedLayout>} />
            <Route path="/admin/worker-details" element={<ProtectedLayout role="admin"><WorkerDetails /></ProtectedLayout>} />
            <Route path="/admin/supervisors" element={<ProtectedLayout role="admin"><Supervisors /></ProtectedLayout>} />
            <Route path="/admin/users" element={<ProtectedLayout role="admin"><UserManagement /></ProtectedLayout>} />
            <Route path="/admin/leave" element={<ProtectedLayout role="admin"><AdminLeave /></ProtectedLayout>} />
            <Route path="/admin/live-map" element={<ProtectedLayout role="admin"><LiveMap /></ProtectedLayout>} />
            <Route path="/admin/hazards" element={<ProtectedLayout role="admin"><AdminHazards /></ProtectedLayout>} />
            <Route path="/admin/sos-center" element={<ProtectedLayout role="admin"><SOSCenter /></ProtectedLayout>} />
            <Route path="/admin/equipment" element={<ProtectedLayout role="admin"><EquipmentIssues /></ProtectedLayout>} />
            <Route path="/admin/ppe-monitoring" element={<ProtectedLayout role="admin"><PPEMonitoring /></ProtectedLayout>} />
            <Route path="/admin/checklists" element={<ProtectedLayout role="admin"><SafetyChecklists /></ProtectedLayout>} />
            <Route path="/admin/attendance" element={<ProtectedLayout role="admin"><AttendanceShifts /></ProtectedLayout>} />
            <Route path="/admin/safety-scores" element={<ProtectedLayout role="admin"><SafetyScores /></ProtectedLayout>} />
            <Route path="/admin/zones" element={<ProtectedLayout role="admin"><MineZonesGeofencing /></ProtectedLayout>} />
            <Route path="/admin/environment" element={<ProtectedLayout role="admin"><EnvironmentMonitoring /></ProtectedLayout>} />
            <Route path="/admin/communication" element={<ProtectedLayout role="admin"><CommunicationCenter /></ProtectedLayout>} />
            <Route path="/admin/notifications" element={<ProtectedLayout role="admin"><AdminNotifications /></ProtectedLayout>} />
            <Route path="/admin/incident-history" element={<ProtectedLayout role="admin"><AdminIncidentHistory /></ProtectedLayout>} />
            <Route path="/admin/analytics" element={<ProtectedLayout role="admin"><AdminAnalytics /></ProtectedLayout>} />
            <Route path="/admin/reports" element={<ProtectedLayout role="admin"><Reports /></ProtectedLayout>} />
            <Route path="/admin/settings" element={<ProtectedLayout role="admin"><Settings /></ProtectedLayout>} />

            {/* Supervisor Routes */}
            <Route path="/supervisor/dashboard" element={<ProtectedLayout role="supervisor"><SupervisorDashboard /></ProtectedLayout>} />
            <Route path="/supervisor/workers" element={<ProtectedLayout role="supervisor"><SupervisorWorkers /></ProtectedLayout>} />
            <Route path="/supervisor/shifts" element={<ProtectedLayout role="supervisor"><SupervisorShifts /></ProtectedLayout>} />
            <Route path="/supervisor/live-tracking" element={<ProtectedLayout role="supervisor"><SupervisorLiveTracking /></ProtectedLayout>} />
            <Route path="/supervisor/emergency-center" element={<ProtectedLayout role="supervisor"><SupervisorEmergencyCenter /></ProtectedLayout>} />
            <Route path="/supervisor/hazards" element={<ProtectedLayout role="supervisor"><SupervisorHazards /></ProtectedLayout>} />
            <Route path="/supervisor/equipment" element={<ProtectedLayout role="supervisor"><SupervisorEquipment /></ProtectedLayout>} />
            <Route path="/supervisor/ppe-monitoring" element={<ProtectedLayout role="supervisor"><SupervisorPPEMonitoring /></ProtectedLayout>} />
            <Route path="/supervisor/checklists" element={<ProtectedLayout role="supervisor"><SupervisorChecklists /></ProtectedLayout>} />
            <Route path="/supervisor/attendance" element={<ProtectedLayout role="supervisor"><SupervisorAttendance /></ProtectedLayout>} />
            <Route path="/supervisor/leave" element={<ProtectedLayout role="supervisor"><SupervisorLeave /></ProtectedLayout>} />
            <Route path="/supervisor/health" element={<ProtectedLayout role="supervisor"><SupervisorHealthMonitoring /></ProtectedLayout>} />
            <Route path="/supervisor/safety-scores" element={<ProtectedLayout role="supervisor"><SupervisorSafetyScores /></ProtectedLayout>} />
            <Route path="/supervisor/zones" element={<ProtectedLayout role="supervisor"><SupervisorZones /></ProtectedLayout>} />
            <Route path="/supervisor/geofence-alerts" element={<ProtectedLayout role="supervisor"><SupervisorGeofenceAlerts /></ProtectedLayout>} />
            <Route path="/supervisor/environment" element={<ProtectedLayout role="supervisor"><SupervisorEnvironment /></ProtectedLayout>} />
            <Route path="/supervisor/mine-monitoring" element={<ProtectedLayout role="supervisor"><SupervisorMineMonitoring /></ProtectedLayout>} />
            <Route path="/supervisor/tasks" element={<ProtectedLayout role="supervisor"><SupervisorTaskManagement /></ProtectedLayout>} />
            <Route path="/supervisor/communication" element={<ProtectedLayout role="supervisor"><SupervisorCommunication /></ProtectedLayout>} />
            <Route path="/supervisor/announcements" element={<ProtectedLayout role="supervisor"><SupervisorAnnouncements /></ProtectedLayout>} />
            <Route path="/supervisor/notifications" element={<ProtectedLayout role="supervisor"><SupervisorNotifications /></ProtectedLayout>} />
            <Route path="/supervisor/incidents" element={<ProtectedLayout role="supervisor"><SupervisorIncidents /></ProtectedLayout>} />
            <Route path="/supervisor/shift-handover" element={<ProtectedLayout role="supervisor"><SupervisorShiftHandover /></ProtectedLayout>} />
            <Route path="/supervisor/analytics" element={<ProtectedLayout role="supervisor"><SupervisorSafetyAnalytics /></ProtectedLayout>} />
            <Route path="/supervisor/reports" element={<ProtectedLayout role="supervisor"><SupervisorReports /></ProtectedLayout>} />
            <Route path="/supervisor/profile" element={<ProtectedLayout role="supervisor"><SupervisorProfile /></ProtectedLayout>} />

            {/* Emergency Officer Routes */}
            <Route path="/emergency/dashboard" element={<ProtectedLayout role="emergency_officer"><EmergencyDashboard /></ProtectedLayout>} />
            <Route path="/emergency/sos-center" element={<ProtectedLayout role="emergency_officer"><EmergencySOSCenter /></ProtectedLayout>} />
            <Route path="/emergency/live-map" element={<ProtectedLayout role="emergency_officer"><EmergencyLiveMap /></ProtectedLayout>} />
            <Route path="/emergency/hazards" element={<ProtectedLayout role="emergency_officer"><EmergencyHazards /></ProtectedLayout>} />
            <Route path="/emergency/dispatch" element={<ProtectedLayout role="emergency_officer"><EmergencyDispatch /></ProtectedLayout>} />
            <Route path="/emergency/broadcast" element={<ProtectedLayout role="emergency_officer"><EmergencyBroadcast /></ProtectedLayout>} />
            <Route path="/emergency/environment" element={<ProtectedLayout role="emergency_officer"><EmergencyEnvironment /></ProtectedLayout>} />
            <Route path="/emergency/incidents" element={<ProtectedLayout role="emergency_officer"><EmergencyIncidentLogs /></ProtectedLayout>} />
            <Route path="/emergency/communication" element={<ProtectedLayout role="emergency_officer"><SupervisorCommunication /></ProtectedLayout>} />
            <Route path="/emergency/leave" element={<ProtectedLayout role="emergency_officer"><EmergencyLeave /></ProtectedLayout>} />
            <Route path="/emergency/notifications" element={<ProtectedLayout role="emergency_officer"><SupervisorNotifications /></ProtectedLayout>} />
            <Route path="/emergency/profile" element={<ProtectedLayout role="emergency_officer"><EmergencyProfile /></ProtectedLayout>} />

            {/* Fallback Catch-all Route */}
            <Route
              path="*"
              element={
                isAuthenticated ? (
                  userRole === 'admin' ? (
                    <Navigate to="/admin/dashboard" replace />
                  ) : userRole === 'supervisor' ? (
                    <Navigate to="/supervisor/dashboard" replace />
                  ) : userRole === 'emergency_officer' ? (
                    <Navigate to="/emergency/dashboard" replace />
                  ) : (
                    <Navigate to="/worker/dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </Router>
      </GeolocationProvider>
    </SocketProvider>
    </ThemeProvider>
  );
}


export default App;