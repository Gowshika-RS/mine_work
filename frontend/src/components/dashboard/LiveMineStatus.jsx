import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { motion } from 'framer-motion';

const sensorConfig = [
  { key: 'methane', label: 'Methane', unit: '%', icon: '🔥', safe: [0, 1.0], warn: [1.0, 2.0], base: 0.8 },
  { key: 'oxygen', label: 'Oxygen', unit: '%', icon: '💨', safe: [19.5, 23], warn: [18, 19.5], base: 20.1, invert: true },
  { key: 'co', label: 'Carbon Monoxide', unit: 'ppm', icon: '☠️', safe: [0, 25], warn: [25, 50], base: 18 },
  { key: 'humidity', label: 'Humidity', unit: '%', icon: '💧', safe: [30, 70], warn: [70, 85], base: 62 },
  { key: 'smoke', label: 'Smoke', unit: 'µg/m³', icon: '🌫️', safe: [0, 50], warn: [50, 100], base: 22 },
  { key: 'vibration', label: 'Vibration', unit: 'mm/s', icon: '📳', safe: [0, 5], warn: [5, 10], base: 2.8 },
  { key: 'airQuality', label: 'Air Quality', unit: 'AQI', icon: '🌬️', safe: [0, 50], warn: [50, 100], base: 38, invert: false },
];

const getStatus = (value, sensor) => {
  if (sensor.invert) {
    if (value >= sensor.safe[0] && value <= sensor.safe[1]) return 'safe';
    if (value >= sensor.warn[0] && value < sensor.safe[0]) return 'warning';
    return 'danger';
  }
  if (value <= sensor.safe[1]) return 'safe';
  if (value <= sensor.warn[1]) return 'warning';
  return 'danger';
};

const statusColors = {
  safe: { dot: '#00ff88', bg: 'rgba(0,255,136,0.08)', border: 'rgba(0,255,136,0.2)' },
  warning: { dot: '#ffaa00', bg: 'rgba(255,170,0,0.08)', border: 'rgba(255,170,0,0.2)' },
  danger: { dot: '#ff3355', bg: 'rgba(255,51,85,0.08)', border: 'rgba(255,51,85,0.2)' },
};

const LiveMineStatus = () => {
  const [sensors, setSensors] = useState(() => {
    const initial = {};
    sensorConfig.forEach(s => { initial[s.key] = s.base; });
    return initial;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => {
        const next = { ...prev };
        sensorConfig.forEach(s => {
          const drift = (Math.random() - 0.48) * (s.base * 0.08);
          next[s.key] = parseFloat(Math.max(0, prev[s.key] + drift).toFixed(1));
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="glass-card" sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Live Mine Status</Typography>
          <Box sx={{
            width: 8, height: 8, borderRadius: '50%',
            bgcolor: '#00ff88',
            boxShadow: '0 0 8px rgba(0,255,136,0.6)',
            animation: 'dot-blink 1.5s ease-in-out infinite',
          }} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
          {sensorConfig.map((sensor, idx) => {
            const value = sensors[sensor.key];
            const status = getStatus(value, sensor);
            const colors = statusColors[status];
            return (
              <motion.div
                key={sensor.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  p: 1.2, borderRadius: 2,
                  bgcolor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  transition: 'all 0.4s ease',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Typography sx={{ fontSize: '1.1rem' }}>{sensor.icon}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                      {sensor.label}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{
                      fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                      color: colors.dot,
                      textShadow: `0 0 8px ${colors.dot}44`,
                      transition: 'color 0.4s ease',
                    }}>
                      {value} {sensor.unit}
                    </Typography>
                    <Box sx={{
                      width: 8, height: 8, borderRadius: '50%',
                      bgcolor: colors.dot,
                      boxShadow: `0 0 6px ${colors.dot}`,
                      animation: status === 'danger' ? 'dot-blink 0.8s ease-in-out infinite' : 'none',
                    }} />
                  </Box>
                </Box>
              </motion.div>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default LiveMineStatus;
