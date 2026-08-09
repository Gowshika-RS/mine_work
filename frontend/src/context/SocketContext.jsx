import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Snackbar, Alert } from '@mui/material';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeSOSAlerts, setActiveSOSAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  const socketRef = useRef(null);
  const pingIntervalRef = useRef(null);

  const connectSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect via WS
    const wsUrl = `ws://127.0.0.1:8000/ws?token=${token}`;

    console.log("Connecting to Socket.IO/WebSocket:", wsUrl);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected successfully!");
        setIsConnected(true);
        setSocket(ws);
        socketRef.current = ws;

        // Keep-alive ping
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message received:", data);

          if (data.type === "pong") return;

          // SOS Alert triggered
          if (data.type === "sos_alert") {
            setToast({
              open: true,
              message: `🚨 EMERGENCY SOS! Worker ${data.worker_name} (${data.emergency_type}) at GPS: ${data.latitude}, ${data.longitude}`,
              severity: 'error'
            });
            setActiveSOSAlerts((prev) => [data, ...prev.filter(a => a.id !== data.id)]);
            setNotifications((prev) => [{
              id: Date.now(),
              title: `EMERGENCY SOS: ${data.emergency_type}`,
              message: `${data.worker_name} triggered SOS distress beacon.`,
              priority: 'emergency',
              timestamp: data.timestamp,
              is_read: false
            }, ...prev]);
            setUnreadNotifCount((c) => c + 1);
          }

          // SOS Status change
          if (data.type === "sos_status_change") {
            setToast({
              open: true,
              message: `ℹ️ SOS #${data.id} (${data.emergency_type}) status updated to ${data.status.toUpperCase()}`,
              severity: data.status === 'resolved' ? 'success' : 'warning'
            });
            setActiveSOSAlerts((prev) => prev.map(a => a.id === data.id ? { ...a, status: data.status } : a));
          }

          // AI Hazard Report detected
          if (data.type === "hazard_report") {
            setToast({
              open: true,
              message: `⚠️ HAZARD REPORTED: ${data.hazard_type} (${data.confidence}%) by ${data.reporter_name}`,
              severity: data.severity === 'critical' ? 'error' : 'warning'
            });
            setNotifications((prev) => [{
              id: Date.now(),
              title: `Hazard: ${data.hazard_type}`,
              message: `${data.reporter_name} reported ${data.severity} severity hazard at ${data.location}`,
              priority: data.severity,
              timestamp: data.timestamp,
              is_read: false
            }, ...prev]);
            setUnreadNotifCount((c) => c + 1);
          }

          // New Chat Message
          if (data.type === "new_message") {
            setUnreadChatCount((c) => c + 1);
            if (data.message_type === "emergency") {
              setToast({
                open: true,
                message: `📢 EMERGENCY BROADCAST: ${data.content}`,
                severity: 'error'
              });
            }
          }

          // Attendance update
          if (data.type === "attendance_update") {
            setNotifications((prev) => [{
              id: Date.now(),
              title: `Attendance Checked In`,
              message: `${data.worker_name} checked in (${data.status.toUpperCase()}) at ${data.check_in_time}`,
              priority: 'info',
              timestamp: data.check_in_time,
              is_read: false
            }, ...prev]);
          }

        } catch (e) {
          console.error("Failed to parse WebSocket message:", e);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected.");
        setIsConnected(false);
        setSocket(null);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        // Auto retry after 5s if logged in
        setTimeout(() => {
          if (localStorage.getItem('token')) {
            connectSocket();
          }
        }, 5000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };

    } catch (err) {
      console.error("Could not instantiate WebSocket:", err);
    }
  };

  useEffect(() => {
    connectSocket();
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, []);

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        activeSOSAlerts,
        notifications,
        unreadNotifCount,
        unreadChatCount,
        setUnreadNotifCount,
        setUnreadChatCount,
        connectSocket
      }}
    >
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} variant="filled" sx={{ width: '100%', fontWeight: 'bold' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
