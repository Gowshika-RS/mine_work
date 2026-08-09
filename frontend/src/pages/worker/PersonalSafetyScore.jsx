import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Stack
} from "@mui/material";
import {
  Shield as SafetyIcon,
  TrendingUp as TrendUpIcon,
  CheckCircle as CheckIcon
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import apiClient from "../../api/client";

export default function PersonalSafetyScore() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSafetyScore();
  }, []);

  const fetchSafetyScore = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/safety/personal-score");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load safety score:", err);
      setError(t('common.error') || "Could not load safety score data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const {
    current_score = 95.0,
    weekly_score = 92.5,
    monthly_score = 90.0,
    color_status = "Excellent",
    color_code = "#22c55e",
    factors = [],
    trend_history = []
  } = data || {};

  const getTranslatedFactorName = (name) => {
    if (name.includes("Checklist")) return t('factors.checklist');
    if (name.includes("PPE")) return t('factors.ppe');
    if (name.includes("Timely")) return t('factors.timely');
    if (name.includes("Attendance")) return t('factors.attendance');
    if (name.includes("Hazard")) return t('factors.hazard');
    if (name.includes("Violations")) return t('factors.violations');
    return name;
  };

  const getTranslatedStatus = (statusStr) => {
    const key = statusStr.toLowerCase().replace(/\s+/g, '');
    if (key === 'excellent') return t('safetyScore.excellent');
    if (key === 'good') return t('safetyScore.good');
    if (key.includes('need') || key.includes('improvement')) return t('safetyScore.needsImprovement');
    return statusStr;
  };

  const getTranslatedDay = (dayStr) => {
    if (!dayStr) return "";
    const key = dayStr.toLowerCase().slice(0, 3);
    return t(`days.${key}`) || dayStr;
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
          border: "1px solid #334155"
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1.5 }}>
          <SafetyIcon sx={{ fontSize: 36, color: color_code }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {t('safetyScore.title')}
            </Typography>
            <Typography variant="body2" color="#94a3b8">
              {t('safetyScore.description')}
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Hero Score Cards Grid */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {/* Current Score Gauge Card */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                bgcolor: "#090d16",
                border: `2px solid ${color_code}`,
                borderRadius: 3,
                p: 2.5,
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <Typography variant="caption" sx={{ color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
                {t('safetyScore.todayCurrentScore')}
              </Typography>

              <Box sx={{ my: 2 }}>
                <Typography variant="h1" fontWeight="800" sx={{ color: color_code, fontSize: "3.5rem" }}>
                  {current_score}
                </Typography>
                <Typography variant="body2" color="#94a3b8">{t('safetyScore.outOf100')}</Typography>
              </Box>

              <Chip
                label={`${getTranslatedStatus(color_status)} ${t('safetyScore.compliance')}`}
                sx={{
                  bgcolor: `${color_code}22`,
                  color: color_code,
                  borderColor: color_code,
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  py: 0.5
                }}
              />
            </Card>
          </Grid>

          {/* Weekly Average */}
          <Grid item xs={6} md={4}>
            <Card sx={{ bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 3, p: 2.5, height: "100%" }}>
              <Typography variant="caption" sx={{ color: "#94a3b8", textTransform: "uppercase" }}>
                {t('safetyScore.weeklyAverage')}
              </Typography>
              <Typography variant="h3" fontWeight="bold" sx={{ color: "#38bdf8", my: 1.5 }}>
                {weekly_score}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TrendUpIcon sx={{ color: "#22c55e", fontSize: 20 }} />
                <Typography variant="caption" color="#4ade80">
                  {t('safetyScore.topSafetyRank')}
                </Typography>
              </Stack>
            </Card>
          </Grid>

          {/* Monthly Average */}
          <Grid item xs={6} md={4}>
            <Card sx={{ bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 3, p: 2.5, height: "100%" }}>
              <Typography variant="caption" sx={{ color: "#94a3b8", textTransform: "uppercase" }}>
                {t('safetyScore.monthlyAverage')}
              </Typography>
              <Typography variant="h3" fontWeight="bold" sx={{ color: "#a855f7", my: 1.5 }}>
                {monthly_score}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckIcon sx={{ color: "#a855f7", fontSize: 20 }} />
                <Typography variant="caption" color="#c084fc">
                  {t('safetyScore.consistentSafetyStandard')}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Color Indicators Legend */}
        <Paper sx={{ p: 2, bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 3, mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#38bdf8", mb: 1.5 }}>
            🎨 {t('safetyScore.scoreClassification')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" gap={1.5} p={1} borderRadius={2} bgcolor="rgba(34, 197, 94, 0.1)">
                <Box width={16} height={16} borderRadius="50%" bgcolor="#22c55e" />
                <Box>
                  <Typography variant="body2" fontWeight="bold" color="#4ade80">
                    {t('safetyScore.excellentRange')}
                  </Typography>
                  <Typography variant="caption" color="#94a3b8">{t('safetyScore.fullSafetyBonus')}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" gap={1.5} p={1} borderRadius={2} bgcolor="rgba(234, 179, 8, 0.1)">
                <Box width={16} height={16} borderRadius="50%" bgcolor="#eab308" />
                <Box>
                  <Typography variant="body2" fontWeight="bold" color="#facc15">
                    {t('safetyScore.goodRange')}
                  </Typography>
                  <Typography variant="caption" color="#94a3b8">{t('safetyScore.minorChecksRecommended')}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" gap={1.5} p={1} borderRadius={2} bgcolor="rgba(239, 68, 68, 0.1)">
                <Box width={16} height={16} borderRadius="50%" bgcolor="#ef4444" />
                <Box>
                  <Typography variant="body2" fontWeight="bold" color="#f87171">
                    {t('safetyScore.needsImprovementRange')}
                  </Typography>
                  <Typography variant="caption" color="#94a3b8">{t('safetyScore.supervisorReviewRequired')}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Factors Breakdown & Trend Graph Grid */}
        <Grid container spacing={3}>
          {/* Factor Breakdown */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 3, p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#38bdf8", mb: 2 }}>
                📊 {t('safetyScore.componentBreakdown')}
              </Typography>

              <Stack spacing={2}>
                {factors.map((f, idx) => {
                  const pct = Math.round((f.points / f.max_points) * 100);
                  return (
                    <Box key={idx}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" color="#fff" fontWeight="500">
                          {getTranslatedFactorName(f.name)}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="#38bdf8">
                          +{f.points} / {f.max_points} {t('safetyScore.pts')}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "#1e293b",
                          "& .MuiLinearProgress-bar": { bgcolor: pct === 100 ? "#22c55e" : "#0284c7" }
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Card>
          </Grid>

          {/* Score Trend Graph (Visual Bar Chart) */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: "#090d16", border: "1px solid #334155", borderRadius: 3, p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#38bdf8", mb: 2 }}>
                📈 {t('safetyScore.trendGraph')}
              </Typography>

              <Box sx={{ height: 220, display: "flex", alignItems: "flex-end", gap: 1.5, pt: 3, pb: 1, px: 1 }}>
                {trend_history.map((tItem, idx) => {
                  const barHeight = Math.max(20, (tItem.score / 100) * 160);
                  const isToday = idx === trend_history.length - 1;
                  return (
                    <Box key={idx} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Typography variant="caption" sx={{ color: isToday ? "#38bdf8" : "#94a3b8", fontSize: "0.7rem", fontWeight: isToday ? "bold" : "normal", mb: 0.5 }}>
                        {tItem.score}
                      </Typography>
                      <Box
                        sx={{
                          width: "100%",
                          height: `${barHeight}px`,
                          bgcolor: isToday ? color_code : (tItem.score >= 90 ? "#0284c7" : "#eab308"),
                          borderRadius: "4px 4px 0 0",
                          transition: "height 0.3s ease"
                        }}
                      />
                      <Typography variant="caption" sx={{ color: isToday ? "#fff" : "#64748b", fontSize: "0.75rem", mt: 1, fontWeight: isToday ? "bold" : "normal" }}>
                        {getTranslatedDay(tItem.day)}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
