import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { motion } from 'framer-motion';

const AIRiskMeter = ({ score = 0, level = 'low' }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = () => {
    if (animatedScore >= 70) return { main: '#ff3355', glow: 'rgba(255, 51, 85, 0.4)', label: 'CRITICAL' };
    if (animatedScore >= 40) return { main: '#ffaa00', glow: 'rgba(255, 170, 0, 0.4)', label: 'MODERATE' };
    return { main: '#00ff88', glow: 'rgba(0, 255, 136, 0.4)', label: 'SAFE' };
  };

  const colorData = getColor();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
        <Box sx={{ position: 'relative', width: 200, height: 200 }}>
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background ring */}
            <circle
              cx="100" cy="100" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="12"
            />
            {/* Animated progress ring */}
            <circle
              cx="100" cy="100" r={radius}
              fill="none"
              stroke={colorData.main}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease',
                filter: `drop-shadow(0 0 8px ${colorData.glow})`,
              }}
            />
            {/* Outer glow ring */}
            <circle
              cx="100" cy="100" r={radius + 8}
              fill="none"
              stroke={colorData.main}
              strokeWidth="1"
              opacity="0.2"
              style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
            />
          </svg>
          {/* Center content */}
          <Box sx={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: colorData.main,
                lineHeight: 1,
                textShadow: `0 0 20px ${colorData.glow}`,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {animatedScore}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, letterSpacing: 1 }}>
              RISK SCORE
            </Typography>
          </Box>
        </Box>
        <Chip
          label={colorData.label}
          sx={{
            mt: 2,
            bgcolor: `${colorData.main}22`,
            color: colorData.main,
            fontWeight: 800,
            fontSize: '0.85rem',
            letterSpacing: 2,
            border: `1px solid ${colorData.main}44`,
            boxShadow: `0 0 12px ${colorData.glow}`,
            animation: 'breathe 3s ease-in-out infinite',
          }}
        />
      </Box>
    </motion.div>
  );
};

export default AIRiskMeter;
