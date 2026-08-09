import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Alert,
  Divider,
  Stack,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  FreeBreakfast as BreakIcon,
  Warning as WarningIcon,
  NotificationsActive as AlertIcon,
  FitnessCenter as FatigueIcon,
} from "@mui/icons-material";

export default function ShiftMonitoring() {
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(4 * 3600 + 25 * 60 + 10); // 4h 25m 10s into shift
  const [breakSeconds, setBreakSeconds] = useState(15 * 60); // 15 mins break taken
  const [isOnBreak, setIsOnBreak] = useState(false);

  const SHIFT_LIMIT_SECONDS = 8 * 3600; // 8 hours max normal shift

  useEffect(() => {
    let interval = null;
    if (isClockedIn) {
      interval = setInterval(() => {
        if (isOnBreak) {
          setBreakSeconds((prev) => prev + 1);
        } else {
          setSecondsElapsed((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClockedIn, isOnBreak]);

  const formatHMS = (totalSec) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const remainingSeconds = Math.max(0, SHIFT_LIMIT_SECONDS - secondsElapsed);
  const overtimeSeconds = Math.max(0, secondsElapsed - SHIFT_LIMIT_SECONDS);
  const progressPercent = Math.min(100, (secondsElapsed / SHIFT_LIMIT_SECONDS) * 100);

  const startTimeStr = "07:00:00 AM";
  const currentTimeStr = new Date().toLocaleTimeString();

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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <TimeIcon sx={{ fontSize: 36, color: "#38bdf8" }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Real-Time Shift Monitoring Dashboard
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Track active working hours, mandatory rest breaks, and safe overtime thresholds
              </Typography>
            </Box>
          </Box>

          <Chip
            label={isClockedIn ? (isOnBreak ? "On Rest Break" : "Shift Active") : "Clocked Out"}
            color={isClockedIn ? (isOnBreak ? "warning" : "success") : "default"}
            sx={{ fontWeight: "bold", fontSize: "0.85rem", px: 1 }}
          />
        </Box>

        {/* Live Timer Display Hero */}
        <Card
          sx={{
            mb: 3,
            bgcolor: "#090d16",
            border: "1px solid #0284c7",
            borderRadius: 3,
            p: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="caption" sx={{ color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase" }}>
            Active Working Time (HH:MM:SS)
          </Typography>
          <Typography variant="h1" fontWeight="800" sx={{ color: "#38bdf8", my: 1, fontFamily: "monospace" }}>
            {formatHMS(secondsElapsed)}
          </Typography>

          <Box sx={{ maxWidth: 600, mx: "auto", mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="caption" color="#94a3b8">
                Shift Progress ({progressPercent.toFixed(0)}%)
              </Typography>
              <Typography variant="caption" color="#94a3b8">
                Remaining: {formatHMS(remainingSeconds)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: "#334155",
                "& .MuiLinearProgress-bar": { bgcolor: progressPercent > 90 ? "#ef4444" : "#0284c7" },
              }}
            />
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant={isOnBreak ? "contained" : "outlined"}
              color="warning"
              startIcon={<BreakIcon />}
              onClick={() => setIsOnBreak(!isOnBreak)}
            >
              {isOnBreak ? "Resume Work" : "Take Mandatory Break"}
            </Button>
            <Button
              variant="contained"
              color={isClockedIn ? "error" : "success"}
              startIcon={isClockedIn ? <StopIcon /> : <StartIcon />}
              onClick={() => setIsClockedIn(!isClockedIn)}
            >
              {isClockedIn ? "Clock Out of Shift" : "Clock In"}
            </Button>
          </Stack>
        </Card>

        {/* 6 Key Stat Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: "Shift Start Time", val: startTimeStr, color: "#cbd5e1" },
            { label: "Current Time", val: currentTimeStr, color: "#cbd5e1" },
            { label: "Accumulated Break Time", val: formatHMS(breakSeconds), color: "#f59e0b" },
            { label: "Remaining Shift Time", val: formatHMS(remainingSeconds), color: "#38bdf8" },
            { label: "Active Overtime", val: formatHMS(overtimeSeconds), color: overtimeSeconds > 0 ? "#ef4444" : "#4ade80" },
            { label: "Fatigue Risk Level", val: "Low (Safe)", color: "#22c55e" },
          ].map((item, idx) => (
            <Grid item xs={6} sm={4} key={idx}>
              <Paper sx={{ p: 2, bgcolor: "#1e293b", border: "1px solid #334155", borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                  {item.label}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: item.color }}>
                  {item.val}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Shift Notifications & Reminders */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5 }}>
          Shift Automated Safety Notifications
        </Typography>

        <Stack spacing={1.5}>
          <Alert severity="info" icon={<AlertIcon />} sx={{ borderRadius: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Break Reminder Alert (Scheduled)
            </Typography>
            You are past 4 hours of active shift. A 15-minute hydration & rest break is recommended.
          </Alert>

          <Alert severity="warning" icon={<WarningIcon />} sx={{ borderRadius: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Shift Ending Warning
            </Typography>
            Remaining shift time is less than 3 hours 35 mins. Ensure daily task logs are updated.
          </Alert>
        </Stack>

        <Divider sx={{ my: 3, borderColor: "#334155" }} />

        {/* Working Hours Summary */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 2 }}>
              <Typography variant="caption" color="#94a3b8">Daily Working Hours</Typography>
              <Typography variant="h5" fontWeight="bold" color="#38bdf8">7.8 Hours</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 2 }}>
              <Typography variant="caption" color="#94a3b8">Weekly Total Hours</Typography>
              <Typography variant="h5" fontWeight="bold" color="#4ade80">38.5 Hours</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 2 }}>
              <Typography variant="caption" color="#94a3b8">Monthly Working Hours</Typography>
              <Typography variant="h5" fontWeight="bold" color="#a855f7">162.0 Hours</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
