import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
} from "@mui/material";
import {
  Shield as ShieldIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Star as StarIcon,
} from "@mui/icons-material";

export default function PersonalSafetyScoreWidget({
  score = 92,
  weeklyScore = 88,
  monthlyScore = 91,
}) {
  const [viewMode, setViewMode] = useState("current"); // current, weekly, monthly

  const activeScore =
    viewMode === "weekly"
      ? weeklyScore
      : viewMode === "monthly"
      ? monthlyScore
      : score;

  const getScoreColor = (val) => {
    if (val >= 90) return { main: "#22c55e", bg: "#052e16", label: "Excellent (Green)", text: "#4ade80" };
    if (val >= 70) return { main: "#eab308", bg: "#422006", label: "Good (Yellow)", text: "#fde047" };
    return { main: "#ef4444", bg: "#450a0a", label: "Needs Improvement (Red)", text: "#fca5a5" };
  };

  const colorMeta = getScoreColor(activeScore);

  const breakdown = [
    { label: "Completed Checklist", points: "+20", max: 20, earned: 20, icon: "📋" },
    { label: "PPE Detection Verified", points: "+20", max: 20, earned: 20, icon: "🦺" },
    { label: "Attendance & Shift Compliance", points: "+15", max: 15, earned: 15, icon: "⏱️" },
    { label: "Timely Check-In", points: "+15", max: 15, earned: 13, icon: "✅" },
    { label: "No Safety Violations", points: "+20", max: 20, earned: 16, icon: "🛑" },
    { label: "Hazard Reporting Contribution", points: "+10", max: 10, earned: 8, icon: "⚠️" },
  ];

  return (
    <Card
      sx={{
        borderRadius: 3,
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#fff",
        border: `1px solid ${colorMeta.main}`,
        boxShadow: `0 4px 20px ${colorMeta.main}22`,
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ShieldIcon sx={{ color: colorMeta.main, fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold">
              Personal Safety Score
            </Typography>
          </Box>
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(e, val) => val && setViewMode(val)}
            sx={{
              "& .MuiToggleButton-root": { color: "#94a3b8", borderColor: "#334155", py: 0.3, px: 1.2, fontSize: "0.75rem" },
              "& .Mui-selected": { color: "#fff !important", bgcolor: "#0284c7 !important" },
            }}
          >
            <ToggleButton value="current">Today</ToggleButton>
            <ToggleButton value="weekly">Weekly</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Grid container spacing={2} alignItems="center">
          {/* Main Score Dial */}
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justify: "center",
                p: 2,
                borderRadius: 3,
                bgcolor: colorMeta.bg,
                border: `1px solid ${colorMeta.main}44`,
              }}
            >
              <Typography variant="h2" fontWeight="800" sx={{ color: colorMeta.main }}>
                {activeScore}
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
                Out of 100 Points
              </Typography>
              <Chip
                label={colorMeta.label}
                size="small"
                sx={{ mt: 1, bgcolor: colorMeta.main, color: "#000", fontWeight: "bold" }}
              />
            </Box>
          </Grid>

          {/* Breakdown Items */}
          <Grid item xs={12} sm={8}>
            <Typography variant="subtitle2" sx={{ color: "#cbd5e1", mb: 1, fontWeight: "bold" }}>
              Score Factor Breakdown:
            </Typography>
            <Grid container spacing={1}>
              {breakdown.map((item, idx) => (
                <Grid item xs={6} key={idx}>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: "#1e293b", border: "1px solid #334155" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 0.5 }}>
                        <span>{item.icon}</span> {item.label}
                      </Typography>
                      <Typography variant="caption" fontWeight="bold" sx={{ color: colorMeta.text }}>
                        {item.earned}/{item.max}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(item.earned / item.max) * 100}
                      sx={{
                        height: 5,
                        borderRadius: 3,
                        bgcolor: "#334155",
                        "& .MuiLinearProgress-bar": { bgcolor: colorMeta.main },
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2, borderColor: "#334155" }} />

        {/* Score Trend Summary */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="caption" sx={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 0.5 }}>
            <TrendingUpIcon sx={{ fontSize: 16, color: "#22c55e" }} /> +4 points increase compared to last week
          </Typography>
          <Typography variant="caption" sx={{ color: "#38bdf8", fontWeight: "bold" }}>
            ⭐ Safety Tier: Gold Safety Master
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
